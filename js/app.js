// CSRF Token handling for AJAX
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', function() {
    // Login Modal Elements
    const modal = document.getElementById('loginModal');
    const loginBtn = document.querySelector('.btn-secondary');
    const closeBtn = document.querySelector('.close');
    const socialLogin = document.querySelector('.social-login');
    const emailLogin = document.querySelector('.email-login');
    const showEmailLoginBtn = document.getElementById('showEmailLogin');
    const backToSocialBtn = document.getElementById('backToSocialLogin');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const togglePasswordBtn = document.getElementById('toggleLoginPassword');
    const passwordInput = document.getElementById('loginPassword');

    // Main buttons elements
    const mainSignupBtn = document.getElementById('mainSignupBtn');
    const mainLoginBtn = document.getElementById('mainLoginBtn');

    // Signup Modal Elements
    const signupModal = document.getElementById('signupModal');
    const showSignupLinks = document.querySelectorAll('#showSignup, #showSignupFromLogin, #showSignupFromEmailSignup');
    const closeSignupBtn = signupModal ? signupModal.querySelector('.close') : null;
    const socialSignup = signupModal ? signupModal.querySelector('.social-signup') : null;
    const emailSignup = signupModal ? signupModal.querySelector('.email-signup') : null;
    const showEmailSignupBtn = document.getElementById('showEmailSignup');
    const backToSocialSignupBtn = document.getElementById('backToSocialSignup');
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');
    const toggleSignupPasswordBtn = document.getElementById('toggleSignupPassword');
    const signupPasswordInput = document.getElementById('signupPassword');
    const agreeRulesCheckbox = document.getElementById('agreeRules');
    const signupSubmitBtn = document.getElementById('signupSubmitBtn');

    // Email Verification Elements
    const verifyEmailModal = document.getElementById('verifyEmailModal');
    const verifyEmailForm = document.getElementById('verifyEmailForm');
    const verifyError = document.getElementById('verifyError');
    const verifyEmailAddress = document.getElementById('verifyEmailAddress');
    const verifyEmailInput = document.getElementById('verifyEmail');
    const resendCodeBtn = document.getElementById('resendCode');
    const closeVerifyBtn = verifyEmailModal ? verifyEmailModal.querySelector('.close') : null;

    // Handle successful signup - show verification modal
    function showVerificationModal(email) {
        if (verifyEmailAddress && verifyEmailInput) {
            verifyEmailAddress.textContent = email;
            verifyEmailInput.value = email;
        }
        if (signupModal) signupModal.style.display = 'none';
        if (verifyEmailModal) verifyEmailModal.style.display = 'block';
    }

    // ===== LOGIN MODAL FUNCTIONALITY =====

    // Open modal when login button is clicked
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (modal) modal.style.display = 'block';
            if (socialLogin) socialLogin.style.display = 'block';
            if (emailLogin) emailLogin.style.display = 'none';
            if (loginError) loginError.style.display = 'none';
        });
    }

    // Close modal when X is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (modal) modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            if (modal) modal.style.display = 'none';
        }
        if (event.target === signupModal) {
            if (signupModal) signupModal.style.display = 'none';
        }
        if (event.target === verifyEmailModal) {
            if (verifyEmailModal) verifyEmailModal.style.display = 'none';
        }
    });

    // Show email login form
    if (showEmailLoginBtn) {
        showEmailLoginBtn.addEventListener('click', function() {
            if (socialLogin) socialLogin.style.display = 'none';
            if (emailLogin) emailLogin.style.display = 'block';
        });
    }

    // Back to social login
    if (backToSocialBtn) {
        backToSocialBtn.addEventListener('click', function() {
            if (emailLogin) emailLogin.style.display = 'none';
            if (socialLogin) socialLogin.style.display = 'block';
            if (loginError) loginError.style.display = 'none';
        });
    }

    // Toggle password visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Create FormData and append CSRF token
            const formData = new FormData(this);
            formData.append('csrfmiddlewaretoken', csrftoken);

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrftoken,
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.redirect_url) {
                        window.location.href = data.redirect_url;
                    } else {
                        window.location.href = '/marketplace/';
                    }
                } else {
                    if (loginError) {
                        loginError.style.display = 'block';
                        loginError.textContent = data.error || 'Invalid email or password';
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (loginError) {
                    loginError.style.display = 'block';
                    loginError.textContent = 'An error occurred. Please try again.';
                }
            });
        });
    }

    // ===== SIGNUP MODAL FUNCTIONALITY =====

    // Open signup modal when signup links are clicked
    if (showSignupLinks.length > 0) {
        showSignupLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                // Close login modal if open
                if (modal) modal.style.display = 'none';
                // Open signup modal
                if (signupModal) signupModal.style.display = 'block';
                if (socialSignup) socialSignup.style.display = 'block';
                if (emailSignup) emailSignup.style.display = 'none';
                if (signupError) signupError.style.display = 'none';
            });
        });
    }

    // Close signup modal
    if (closeSignupBtn) {
        closeSignupBtn.addEventListener('click', function() {
            if (signupModal) signupModal.style.display = 'none';
        });
    }

    // Show email signup form
    if (showEmailSignupBtn) {
        showEmailSignupBtn.addEventListener('click', function() {
            if (socialSignup) socialSignup.style.display = 'none';
            if (emailSignup) emailSignup.style.display = 'block';
        });
    }

    // Back to social signup
    if (backToSocialSignupBtn) {
        backToSocialSignupBtn.addEventListener('click', function() {
            if (emailSignup) emailSignup.style.display = 'none';
            if (socialSignup) socialSignup.style.display = 'block';
            if (signupError) signupError.style.display = 'none';
        });
    }

    // Toggle signup password visibility
    if (toggleSignupPasswordBtn && signupPasswordInput) {
        toggleSignupPasswordBtn.addEventListener('click', function() {
            if (signupPasswordInput.type === 'password') {
                signupPasswordInput.type = 'text';
                toggleSignupPasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                signupPasswordInput.type = 'password';
                toggleSignupPasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }

    // Enable/disable signup button based on checkbox
    if (agreeRulesCheckbox && signupSubmitBtn) {
        agreeRulesCheckbox.addEventListener('change', function() {
            signupSubmitBtn.disabled = !this.checked;
        });

        // Initial state
        signupSubmitBtn.disabled = !agreeRulesCheckbox.checked;
    }

    // Handle signup form submission with CSRF protection
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Debug: Log all form data
            const formData = new FormData(this);
            console.log('Form data being sent:');
            for (let [key, value] of formData.entries()) {
                console.log(key + ': ' + value);
            }

            formData.append('csrfmiddlewaretoken', csrftoken);

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrftoken,
                },
            })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Server response:', data);
                if (data.success) {
                    if (data.next === 'verify_email') {
                        showVerificationModal(data.email);
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    if (signupError) {
                        signupError.style.display = 'block';
                        // Show specific field errors if available
                        if (data.errors) {
                            let errorMessages = [];
                            for (const field in data.errors) {
                                errorMessages.push(...data.errors[field]);
                            }
                            signupError.innerHTML = errorMessages.join('<br>');
                        } else {
                            signupError.textContent = data.error || 'An error occurred';
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (signupError) {
                    signupError.style.display = 'block';
                    signupError.textContent = 'An error occurred. Please try again.';
                }
            });
        });
    }

    // Show login from signup
    const showLoginFromSignupLinks = document.querySelectorAll('#showLoginFromSignup, #showLoginFromEmailSignup');
    if (showLoginFromSignupLinks.length > 0) {
        showLoginFromSignupLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (signupModal) signupModal.style.display = 'none';
                if (modal) {
                    modal.style.display = 'block';
                    if (socialLogin) socialLogin.style.display = 'block';
                    if (emailLogin) emailLogin.style.display = 'none';
                }
            });
        });
    }

    // Main signup button functionality
    if (mainSignupBtn) {
        mainSignupBtn.addEventListener('click', function() {
            if (signupModal) signupModal.style.display = 'block';
            if (socialSignup) socialSignup.style.display = 'block';
            if (emailSignup) emailSignup.style.display = 'none';
            if (signupError) signupError.style.display = 'none';
        });
    }

    // Main login button functionality
    if (mainLoginBtn) {
        mainLoginBtn.addEventListener('click', function() {
            if (modal) modal.style.display = 'block';
            if (socialLogin) socialLogin.style.display = 'block';
            if (emailLogin) emailLogin.style.display = 'none';
            if (loginError) loginError.style.display = 'none';
        });
    }

    // Social login buttons (placeholder functionality)
    document.querySelectorAll('.google-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Google authentication will be implemented with Django Allauth');
        });
    });

    document.querySelectorAll('.facebook-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Facebook authentication will be implemented with Django Allauth');
        });
    });

    // Handle verification form submission
    if (verifyEmailForm) {
        verifyEmailForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            formData.append('csrfmiddlewaretoken', csrftoken);

            fetch('/accounts/verify-email/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrftoken,
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.redirect_url) {
                        window.location.href = data.redirect_url;
                    } else {
                        window.location.href = '/marketplace/';
                    }
                } else {
                    if (verifyError) {
                        verifyError.style.display = 'block';
                        verifyError.textContent = Object.values(data.errors).join(', ');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (verifyError) {
                    verifyError.style.display = 'block';
                    verifyError.textContent = 'An error occurred. Please try again.';
                }
            });
        });
    }

    // Close verification modal
    if (closeVerifyBtn) {
        closeVerifyBtn.addEventListener('click', function() {
            if (verifyEmailModal) verifyEmailModal.style.display = 'none';
        });
    }

    // Resend verification code
    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Implement resend functionality here
            alert('Resend functionality will be implemented');
        });
    }
});