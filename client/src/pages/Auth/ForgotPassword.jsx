import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On success
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-float-slower" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="glass-card p-8">
          {/* Back Button */}
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600 
                     dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-6 group"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg">
              {isSubmitted ? (
                <FiCheckCircle className="w-8 h-8 text-white" />
              ) : (
                <FiMail className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="heading-3 gradient-text mb-3">
              {isSubmitted ? 'Check Your Email' : 'Forgot Password'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isSubmitted
                ? `We've sent reset instructions to ${email}`
                : 'Enter your email to receive reset instructions'}
            </p>
          </div>

          {!isSubmitted ? (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="form-input pl-12"
                      placeholder="Enter your registered email"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  If you don't see the email in your inbox, please check your spam folder.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Didn't receive the email?
                </h3>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Check your spam or junk folder</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Make sure you entered the correct email address</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Wait a few minutes and try again</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Try Another Email
                </button>
                <button
                  onClick={() => handleSubmit({ preventDefault: () => {} })}
                  disabled={isLoading}
                  className="btn-primary flex-1"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                      Resending...
                    </>
                  ) : (
                    'Resend Email'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help?{' '}
              <Link
                to="/support"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 
                         dark:hover:text-blue-300 hover:underline transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;