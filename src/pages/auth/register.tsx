import React, { useState } from 'react';
import { authService } from '@/lib/api/services';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';


// Strongly-typed form data
type Coordinates = {
    type: 'Point';
    coordinates: number[];
};

type Location = {
    county: string;
    city: string;
    area: string;
    coordinates: Coordinates;
};

type Profile = {
    firstName: string;
    lastName: string;
};

type FormData = {
    email: string;
    phone: string;
    password: string;
    profile: Profile;
    location: Location;
};

const setNested = <T extends Record<string, any>>(obj: T, keys: string[], value: any): T => {
    if (keys.length === 0) return obj;
    const [first, ...rest] = keys;

    // shallow copy of current level
    const copy: any = Array.isArray(obj) ? obj.slice() : { ...obj };

    if (rest.length === 0) {
        copy[first] = value;
        return copy;
    }

    // ensure next level exists (array if numeric key, object otherwise)
    const nextKey = rest[0];
    const current = copy[first] ?? (isFinite(Number(nextKey)) ? [] : {});
    copy[first] = setNested(current, rest, value);
    return copy;
};

const RegisterPage = () => {
    const {login} = useAuth();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        phone: '',
        password: '',
        profile: { firstName: '', lastName: '' },
        location: {
            county: '',
            city: '',
            area: '',
            coordinates: { type: 'Point', coordinates: [0, 0] }
        }
    });
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [submissionError, setSubmissionError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData((prev) => setNested(prev as any, keys, value));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value } as FormData));
    };

    function validateUserInput({ email, phone, password }: { email: string; phone: string; password: string }) {
  const errors = {email: "", phone: "", password: ""};

  // --- Email validation ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = "Invalid email address.";
  }

  // --- Kenyan phone number validation ---
  const phoneRegex = /^(?:\+254|254|0)?(7\d{8}|1\d{8})$/;
  if (!phone || !phoneRegex.test(phone)) {
    errors.phone = "Invalid Kenyan phone number. Example: 0712345678 or +254712345678";
  }

  // --- Password validation ---
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    errors.password =
      "Password must be at least 8 characters long and contain both letters and numbers.";
  }

  // --- Return ---
  return {
    valid: !errors.email && !errors.phone && !errors.password,
    errors,
  };
}


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { valid, errors } = validateUserInput({
            email: formData.email,
            phone: formData.phone,
            password: formData.password
        });

        if (!valid) {
            setEmailError(errors.email);
            setPhoneError(errors.phone);
            setPasswordError(errors.password);
            return;
        }

        setEmailError("");
        setPhoneError("");
        setPasswordError("");
        // You can parse or validate fields here (e.g. coordinates -> numbers)
        console.log('Registration Data:', formData);

        setSubmissionError("");
        setLoading(true);

        try {
            // Use the service wrapper
            const data = await authService.register(formData);

            if (data?.success) {
                console.log('Registration successful! Please check your email to verify your account.');

                await login(formData.phone, formData.password);

                return;
            }

            setSubmissionError(data?.message || 'Registration failed. Please try again.');
        } catch (err: any) {
            // Handle axios errors explicitly to extract server validation info
            if (axios.isAxiosError(err)) {
                const serverData = err.response?.data;
                const serverMessage = serverData?.message || 'Registration failed';

                // If backend returns field errors in `errors` object, map them to inputs
                const fieldErrors = serverData?.errors;
                if (fieldErrors) {
                    if (fieldErrors.email) setEmailError(fieldErrors.email);
                    if (fieldErrors.phone) setPhoneError(fieldErrors.phone);
                    if (fieldErrors.password) setPasswordError(fieldErrors.password);
                }

                setSubmissionError(serverMessage);
            } else {
                setSubmissionError(err?.message || 'An unexpected error occurred. Please try again.');
            }

            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden grid lg:grid-cols-2">
            {/* Left Side - Branding Section - Fixed, no scroll */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A2647] to-[#003366] text-white p-8 flex-col justify-center items-center fixed left-0 top-0 h-full">
                <div className="max-w-md text-center">
                    <h1 className="text-4xl font-bold mb-4">
                        Fundi <span className="text-orange-500">Connect</span>
                    </h1>
                    <p className="text-xl mb-8 text-gray-200">
                        Connecting skilled fundis with people who need them
                    </p>
                    
                    <div className="text-left space-y-4">
                        <h3 className="text-xl font-semibold mb-4">Why Join Fundi Connect?</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span>Find skilled professionals easily</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span>Verified and trusted fundis</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span>Secure and reliable service</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span>Grow your business opportunities</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Section - Scrollable */}
            <div className="flex-1 lg:ml-1/2 bg-gray-50 overflow-y-auto lg:col-start-2">
                <div className="min-h-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
                    <div className="mx-auto w-full max-w-md">
                        <div className="lg:hidden text-center mb-8">
                            <h1 className="text-3xl font-bold text-[#0A2647]">
                                Fundi <span className="text-orange-500">Connect</span>
                            </h1>
                            <p className="text-gray-600 mt-2">Create your account</p>
                        </div>

                       

                        <form
                            onSubmit={async (e) => {
                                // Prevent default synchronously to stop browser form submission
                                e.preventDefault();
                                try {
                                    await handleSubmit(e as unknown as React.FormEvent);
                                } catch (err: any) {
                                    const msg = err?.response?.data?.message || err?.message || 'An unexpected error occurred.';
                                    console.error('Unhandled submission error:', err);
                                    setSubmissionError(msg);
                                    setLoading(false);
                                }
                            }}
                            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>

                            {/* Personal Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-[#0A2647] mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="profile.firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="profile.firstName"
                                            name="profile.firstName"
                                            value={formData.profile.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="profile.lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="profile.lastName"
                                            name="profile.lastName"
                                            value={formData.profile.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Details */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-[#0A2647] mb-4">Account Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                        />
                                        {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                        />
                                        {phoneError && <p className="text-red-600 text-sm mt-1">{phoneError}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                        />
                                        {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Location Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-[#0A2647] mb-4">Location Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="location.county" className="block text-sm font-medium text-gray-700 mb-1">
                                            County *
                                        </label>
                                        <input
                                            type="text"
                                            id="location.county"
                                            name="location.county"
                                            value={formData.location.county}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                id="location.city"
                                                name="location.city"
                                                value={formData.location.city}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="location.area" className="block text-sm font-medium text-gray-700 mb-1">
                                                Area *
                                            </label>
                                            <input
                                                type="text"
                                                id="location.area"
                                                name="location.area"
                                                value={formData.location.area}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="location.coordinates.coordinates.0" className="block text-sm font-medium text-gray-700 mb-1">
                                                Longitude
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                id="location.coordinates.coordinates.0"
                                                name="location.coordinates.coordinates.0"
                                                value={formData.location.coordinates.coordinates[0]}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="location.coordinates.coordinates.1" className="block text-sm font-medium text-gray-700 mb-1">
                                                Latitude
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                id="location.coordinates.coordinates.1"
                                                name="location.coordinates.coordinates.1"
                                                value={formData.location.coordinates.coordinates[1]}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-orange-500 focus:ring-offset-2 transition duration-200 font-semibold disabled:opacity-60"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                             {submissionError && <p className="text-red-600 text-sm w-full text-center py-2 bg-red-100 border-red-400 border mt-2 rounded-lg">{submissionError}</p>}

                            <p className="text-center text-gray-600 mt-4 text-sm">
                                Already have an account?{' '}
                                <a href="/auth/login" className="text-[#0A2647] hover:text-orange-500 font-medium">
                                    Sign in
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;