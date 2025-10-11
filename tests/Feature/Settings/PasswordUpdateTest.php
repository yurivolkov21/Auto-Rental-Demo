<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_update_page_is_displayed(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('password.edit'));

        $response->assertStatus(200);
    }

    public function test_password_can_be_updated(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('password.edit'))
            ->put(route('password.update'), [
                'current_password' => 'password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('password.edit'));

        $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
    }

    public function test_correct_password_must_be_provided_to_update_password(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('password.edit'))
            ->put(route('password.update'), [
                'current_password' => 'wrong-password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

        $response
            ->assertSessionHasErrors('current_password')
            ->assertRedirect(route('password.edit'));
    }

    public function test_new_password_must_be_different_from_current_password(): void
    {
        /** @var User $user */
        $user = User::factory()->create([
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this
            ->actingAs($user)
            ->from(route('password.edit'))
            ->put(route('password.update'), [
                'current_password' => 'Password123!',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect(route('password.edit'));

        // Verify error message
        $errors = session('errors');
        $this->assertStringContainsString(
            'different from your current password',
            $errors->first('password')
        );
    }

    public function test_password_must_meet_complexity_requirements(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        // Test weak passwords
        $weakPasswords = [
            'short',           // Too short
            'nouppercase1!',   // No uppercase
            'NOLOWERCASE1!',   // No lowercase
            'NoNumbers!',      // No numbers
            'NoSymbols123',    // No symbols
        ];

        foreach ($weakPasswords as $weakPassword) {
            assert($user instanceof User);

            $response = $this
                ->actingAs($user)
                ->from(route('password.edit'))
                ->put(route('password.update'), [
                    'current_password' => 'password',
                    'password' => $weakPassword,
                    'password_confirmation' => $weakPassword,
                ]);

            $response->assertSessionHasErrors('password');
        }
    }
}
