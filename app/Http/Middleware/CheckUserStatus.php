<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * Prevent suspended or banned users from accessing the application.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip check if user is not authenticated
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        // Check if user account is restricted (suspended or banned)
        if ($user->isRestricted()) {
            // Logout the user
            Auth::logout();

            // Invalidate session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Prepare professional error message based on status
            $message = match ($user->status) {
                'suspended' => 'Your account has been temporarily suspended.',
                'banned'    => 'Your account has been permanently banned.',
                default     => 'Your account has been restricted.',
            };

            // Add reason if available
            if ($user->status_note) {
                $message .= " Reason: {$user->status_note}";
            }

            // Redirect to login with error message
            return redirect()->route('login')->with('error', $message);
        }

        return $next($request);
    }
}
