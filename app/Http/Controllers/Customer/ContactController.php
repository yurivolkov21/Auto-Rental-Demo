<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Location;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('customer/contact', [
            'locations' => Location::where('is_popular', true)
                ->orWhere('is_airport', true)
                ->orderBy('is_popular', 'desc')
                ->orderBy('name')
                ->get(['id', 'name', 'address', 'phone', 'email', 'is_airport', 'is_popular']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        $validated['user_id'] = Auth::check() ? Auth::user()->id : null;
        $validated['status'] = 'new';

        Contact::create($validated);

        return redirect()
            ->back()
            ->with('success', 'Thank you for contacting us! We will get back to you soon.');
    }
}
