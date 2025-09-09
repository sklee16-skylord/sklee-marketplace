from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import json
import random
from .forms import CustomUserCreationForm
from .models import CustomUser

# Store verification codes temporarily (in production, use Redis or database)
verification_codes = {}


@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        try:
            # Debug: Print raw POST data
            print(f"Raw POST data: {dict(request.POST)}")

            form = CustomUserCreationForm(request.POST)

            if form.is_valid():
                user = form.save(commit=False)
                user.is_active = False
                user.is_verified = False
                user.save()

                print(f"✅ User created: {user.email}")
                print(f"   Active: {user.is_active}, Verified: {user.is_verified}")
                print(f"   Password set: {bool(user.password)}")

                # Generate verification code
                verification_code = str(random.randint(100000, 999999))
                verification_codes[user.email] = verification_code

                # Send verification email
                try:
                    send_mail(
                        'Verify your SKlee account',
                        f'Your verification code is: {verification_code}',
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        fail_silently=False,
                    )
                    print(f"📧 Email sent to: {user.email}")
                except Exception as e:
                    print(f"📧 Email failed, showing in console: {verification_code}")
                    print(f"   Email error: {e}")

                return JsonResponse({
                    'success': True,
                    'message': 'Verification code sent to your email',
                    'email': user.email,
                    'next': 'verify_email'
                })
            else:
                # Return detailed form errors
                errors = {}
                for field, field_errors in form.errors.items():
                    errors[field] = [str(error) for error in field_errors]

                print(f"❌ Form errors: {errors}")
                return JsonResponse({'success': False, 'errors': errors})

        except Exception as e:
            print(f"🔥 Signup exception: {str(e)}")
            return JsonResponse({'success': False, 'errors': {'general': [str(e)]}})

    return JsonResponse({'success': False, 'errors': {'general': ['Invalid request method']}})


@csrf_exempt
def verify_email_view(request):
    if request.method == 'POST':
        try:
            email = request.POST.get('email')
            code = request.POST.get('code')

            print(f"🔐 Verification attempt - Email: {email}, Code: {code}")
            print(f"   Stored codes: {list(verification_codes.keys())}")

            if email in verification_codes and verification_codes[email] == code:
                # Code is valid
                user = CustomUser.objects.get(email=email)
                user.is_active = True
                user.is_verified = True
                user.save()

                print(f"✅ User verified: {user.email}")
                print(f"   Active: {user.is_active}, Verified: {user.is_verified}")

                # Clean up verification code
                del verification_codes[email]

                # Log the user in
                login(request, user)
                print(f"👤 User logged in: {user.email}")

                return JsonResponse({
                    'success': True,
                    'message': 'Email verified successfully!',
                    'redirect_url': '/marketplace/'  # Changed from 'next' to 'redirect_url'
                })
            else:
                print("❌ Invalid verification code")
                return JsonResponse({
                    'success': False,
                    'errors': {'code': ['Invalid verification code']}
                })

        except Exception as e:
            print(f"🔥 Verification exception: {str(e)}")
            return JsonResponse({'success': False, 'errors': {'general': [str(e)]}})

    return JsonResponse({'success': False, 'errors': {'general': ['Invalid request method']}})


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            # Debug: Print raw POST data to see what's coming in
            print(f"Raw login POST data: {dict(request.POST)}")

            # Get email and password from form data
            email = request.POST.get('email')
            password = request.POST.get('password')

            # If email is None, check for other possible field names
            if email is None:
                # Check for different field names that might be used
                for key in request.POST.keys():
                    if 'email' in key.lower() or 'user' in key.lower() or 'login' in key.lower():
                        email = request.POST.get(key)
                        break

            print(f"🔑 Login attempt - Email: {email}")

            if not email or not password:
                print("❌ Missing email or password")
                return JsonResponse({
                    'success': False,
                    'error': 'Email and password are required'
                })

            # First, try to find the user
            try:
                user_exists = CustomUser.objects.filter(email__iexact=email).exists()
                print(f"   User exists in DB: {user_exists}")

                if user_exists:
                    user = CustomUser.objects.get(email__iexact=email)
                    print(f"   User found: {user.email}")
                    print(f"   Password check: {user.check_password(password)}")
            except CustomUser.DoesNotExist:
                print("   User does not exist")
                user_exists = False
            except Exception as e:
                print(f"   Error checking user: {e}")

            user = authenticate(request, email=email, password=password)

            print(f"   Authenticated user: {user}")
            if user:
                print(f"   User active: {user.is_active}, verified: {user.is_verified}")

            if user is not None:
                if user.is_active and user.is_verified:
                    login(request, user)
                    print(f"✅ Login successful: {user.email}")
                    return JsonResponse({
                        'success': True,
                        'redirect_url': '/marketplace/'  # Add redirect URL
                    })
                else:
                    print("❌ User not active or verified")
                    return JsonResponse({
                        'success': False,
                        'error': 'Please verify your email before logging in'
                    })
            else:
                print("❌ Authentication failed - invalid credentials")
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid email or password'
                })

        except Exception as e:
            print(f"🔥 Login exception: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'An error occurred during login'
            })

    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    })