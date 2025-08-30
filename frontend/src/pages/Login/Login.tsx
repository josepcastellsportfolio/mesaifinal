/**
 * Login page component with form validation and error handling.
 * Uses Telerik UI components for a professional appearance.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Form, 
  Field, 
  FormElement
} from '@progress/kendo-react-form';
import { 
  Input 
} from '@progress/kendo-react-inputs';
import { 
  Button 
} from '@progress/kendo-react-buttons';
import { 
  Card, 
  CardBody 
} from '@progress/kendo-react-layout';
import { useAuthStore } from '@/store/auth.store';
import { useLogin } from '@/queries';
import { ROUTES, VALIDATION } from '../../constants';
import type { LoginCredentials } from '../../types';
import './AuthPages.css';

// Form validation functions
const emailValidator = (value: string) => {
  if (!value) {
    return 'Email is required';
  }
  if (!VALIDATION.EMAIL_REGEX.test(value)) {
    return 'Please enter a valid email address';
  }
  return '';
};

const passwordValidator = (value: string) => {
  if (!value) {
    return 'Password is required';
  }
  if (value.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`;
  }
  return '';
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const loginMutation = useLogin();
  const isSubmittingRef = useRef(false);
  
  const [formData] = useState({
    username: '', // Form field name (will be mapped to email)
    password: '',
  });

  // Get redirect path from location state or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.DASHBOARD;

  const handleSubmit = useCallback(async (dataItem: Record<string, unknown>) => {
    // Prevent multiple submissions
    if (isSubmittingRef.current || loginMutation.isPending) {
      return;
    }

    isSubmittingRef.current = true;
    
    const credentials: LoginCredentials = {
      email: dataItem.username as string, // Using username field but sending as email
      password: dataItem.password as string,
    };

    loginMutation.mutate(credentials, {
      onSuccess: (data) => {
        setUser(data.user);
        navigate(from, { replace: true });
      },
      onError: (error) => {
        console.error('Login failed:', error);
        isSubmittingRef.current = false; // Reset on error
      },
      onSettled: () => {
        // Reset the flag when mutation is complete (success or error)
        isSubmittingRef.current = false;
      }
    });
  }, [loginMutation, setUser, navigate, from]);





  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <CardBody>
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your account to continue</p>
            </div>

            <Form
              initialValues={formData}
              onSubmit={handleSubmit}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className="k-form-fieldset">
                    {/* Email Field */}
                    <Field
                      name="username"
                      component={Input}
                      label="Email"
                      type="email"
                      placeholder="admin@example.com"
                      validator={emailValidator}
                    />

                    {/* Password Field */}
                    <Field
                      name="password"
                      component={Input}
                      label="Password"
                      type="password"
                      validator={passwordValidator}
                    />

                    {/* Error Messages */}
                  {loginMutation.isError && (
                    <div className="error-container" style={{ marginBottom: '16px' }}>
                      <span className="error-message" style={{
                        color: '#d32f2f',
                        marginBottom: '8px',
                        padding: '8px',
                        backgroundColor: '#ffebee',
                        border: '1px solid #ffcdd2',
                        borderRadius: '4px',
                        fontSize: '14px',
                        display: 'block'
                      }}>
                        {typeof loginMutation.error?.message === 'string'
                          ? loginMutation.error.message
                          : Object.entries(loginMutation.error?.message || {})
                              .map(([field, errors]) => {
                                const errorArray = Array.isArray(errors) ? errors : [errors];
                                return errorArray.map(error =>
                                  field === 'non_field_errors' ? error : `${field}: ${error}`
                                ).join(' ');
                              })
                              .join(' ')
                        }
                      </span>
                    </div>
                  )}

                    {/* Submit Button */}
                    <div className="form-actions">
                      <Button
                        type="submit"
                        themeColor="primary"
                        size="large"
                        disabled={!formRenderProps.allowSubmit || loginMutation.isPending || isSubmittingRef.current}
                        className="auth-submit-btn"
                      >
                        {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />

            <div className="auth-footer">
              <div className="auth-links">
                <Link to="/forgot-password" className="auth-link">
                  Forgot your password?
                </Link>
              </div>
              
              <div className="auth-divider">
                <span>Don't have an account?</span>
              </div>
              
              <Link to={ROUTES.REGISTER} className="auth-secondary-btn">
                Create Account
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Additional Info */}
        <div className="auth-info">
          <h3>MESAI FINAL - React Application</h3>
          <p>
            Built with Django REST Framework backend and React TypeScript frontend,
            featuring Telerik UI components for a modern user experience.
          </p>
          <ul>
            <li>✅ JWT Authentication</li>
            <li>✅ Role-based Access Control</li>
            <li>✅ Professional UI Components</li>
            <li>✅ Responsive Design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

