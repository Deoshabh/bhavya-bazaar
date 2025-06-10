/**
 * Enhanced Multi-Step Seller Registration Flow
 * Provides guided onboarding with progress tracking
 */

import React, { useState, useEffect } from 'react';
import { 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  Store as StoreIcon, 
  AccountCircle, 
  ContactMail, 
  Verified,
  CloudUpload,
  CheckCircle
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { label: 'Personal Information', icon: <AccountCircle /> },
  { label: 'Business Details', icon: <StoreIcon /> },
  { label: 'Document Upload', icon: <CloudUpload /> },
  { label: 'Contact Information', icon: <ContactMail /> },
  { label: 'Verification', icon: <Verified /> }
];

const businessCategories = [
  'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books',
  'Automotive', 'Health & Beauty', 'Toys', 'Food & Beverages', 'Other'
];

const EnhancedSellerRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  
  // Form data state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Business Details
    shopName: '',
    businessCategory: '',
    businessType: '',
    businessRegistrationNumber: '',
    description: '',
    
    // Document Upload
    businessLicense: null,
    taxDocument: null,
    identityProof: null,
    
    // Contact Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    
    // Terms and conditions
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    // Calculate overall progress
    const totalSteps = steps.length;
    const currentProgress = ((activeStep + 1) / totalSteps) * 100;
    setProgress(currentProgress);
  }, [activeStep]);

  const handleNext = async () => {
    if (validateStep(activeStep)) {
      if (activeStep === steps.length - 1) {
        await handleSubmit();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!/^\d{10}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
        }
        if (!formData.email) newErrors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
        
      case 1: // Business Details
        if (!formData.shopName) newErrors.shopName = 'Shop name is required';
        if (!formData.businessCategory) newErrors.businessCategory = 'Business category is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.description) newErrors.description = 'Business description is required';
        break;
        
      case 2: // Document Upload
        if (!formData.businessLicense) newErrors.businessLicense = 'Business license is required';
        if (!formData.identityProof) newErrors.identityProof = 'Identity proof is required';
        break;
        
      case 3: // Contact Information
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
        break;
        
      case 4: // Verification
        if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
        if (!formData.acceptPrivacy) newErrors.acceptPrivacy = 'You must accept the privacy policy';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = async (field, file) => {
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload only JPG, PNG, or PDF files');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setUploadProgress(prev => ({ ...prev, [field]: 0 }));
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(prev => ({ ...prev, [field]: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
      
      toast.success(`${field} uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${field}`);
    } finally {
      setUploadProgress(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] instanceof File) {
          submitData.append(key, formData[key]);
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Here you would dispatch your registration action
      // await dispatch(registerSeller(submitData));
      
      toast.success('Registration submitted successfully! We will review your application within 24-48 hours.');
      
      // Redirect to success page or login
      // navigate('/seller-registration-success');
      
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <PersonalInfoStep formData={formData} errors={errors} onChange={handleInputChange} />;
      case 1:
        return <BusinessDetailsStep formData={formData} errors={errors} onChange={handleInputChange} />;
      case 2:
        return <DocumentUploadStep formData={formData} errors={errors} onFileUpload={handleFileUpload} uploadProgress={uploadProgress} />;
      case 3:
        return <ContactInfoStep formData={formData} errors={errors} onChange={handleInputChange} />;
      case 4:
        return <VerificationStep formData={formData} errors={errors} onChange={handleInputChange} />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Become a Seller
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join our marketplace and start selling your products
          </Typography>
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={step.icon}
                sx={{
                  '& .MuiStepIcon-root': {
                    color: index <= activeStep ? 'primary.main' : 'grey.300'
                  }
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 4 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button 
            onClick={handleNext}
            disabled={loading}
            variant="contained"
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Processing...' : activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

// Step Components
const PersonalInfoStep = ({ formData, errors, onChange }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="First Name"
        value={formData.firstName}
        onChange={(e) => onChange('firstName', e.target.value)}
        error={!!errors.firstName}
        helperText={errors.firstName}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Last Name"
        value={formData.lastName}
        onChange={(e) => onChange('lastName', e.target.value)}
        error={!!errors.lastName}
        helperText={errors.lastName}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Phone Number"
        value={formData.phoneNumber}
        onChange={(e) => onChange('phoneNumber', e.target.value)}
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => onChange('email', e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => onChange('password', e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => onChange('confirmPassword', e.target.value)}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        required
      />
    </Grid>
  </Grid>
);

const BusinessDetailsStep = ({ formData, errors, onChange }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Shop Name"
        value={formData.shopName}
        onChange={(e) => onChange('shopName', e.target.value)}
        error={!!errors.shopName}
        helperText={errors.shopName}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth error={!!errors.businessCategory}>
        <InputLabel>Business Category</InputLabel>
        <Select
          value={formData.businessCategory}
          onChange={(e) => onChange('businessCategory', e.target.value)}
          label="Business Category"
        >
          {businessCategories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth error={!!errors.businessType}>
        <InputLabel>Business Type</InputLabel>
        <Select
          value={formData.businessType}
          onChange={(e) => onChange('businessType', e.target.value)}
          label="Business Type"
        >
          <MenuItem value="sole_proprietorship">Sole Proprietorship</MenuItem>
          <MenuItem value="partnership">Partnership</MenuItem>
          <MenuItem value="private_limited">Private Limited</MenuItem>
          <MenuItem value="llp">Limited Liability Partnership</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Business Registration Number (Optional)"
        value={formData.businessRegistrationNumber}
        onChange={(e) => onChange('businessRegistrationNumber', e.target.value)}
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Business Description"
        multiline
        rows={4}
        value={formData.description}
        onChange={(e) => onChange('description', e.target.value)}
        error={!!errors.description}
        helperText={errors.description}
        placeholder="Describe your business, products, and what makes you unique..."
        required
      />
    </Grid>
  </Grid>
);

const DocumentUploadStep = ({ formData, errors, onFileUpload, uploadProgress }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Please upload clear, readable documents. Accepted formats: JPG, PNG, PDF (Max 5MB each)
      </Alert>
    </Grid>
    
    {[
      { key: 'businessLicense', label: 'Business License', required: true },
      { key: 'taxDocument', label: 'Tax Document (GST/VAT)', required: false },
      { key: 'identityProof', label: 'Identity Proof (Aadhar/Passport)', required: true }
    ].map((doc) => (
      <Grid item xs={12} key={doc.key}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">
                {doc.label} {doc.required && <span style={{ color: 'red' }}>*</span>}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {formData[doc.key] && <CheckCircle color="success" />}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => onFileUpload(doc.key, e.target.files[0])}
                  style={{ display: 'none' }}
                  id={`file-${doc.key}`}
                />
                <label htmlFor={`file-${doc.key}`}>
                  <Button variant="outlined" component="span">
                    {formData[doc.key] ? 'Change File' : 'Upload'}
                  </Button>
                </label>
              </Box>
            </Box>
            
            {uploadProgress[doc.key] !== undefined && (
              <LinearProgress variant="determinate" value={uploadProgress[doc.key]} sx={{ mt: 1 }} />
            )}
            
            {formData[doc.key] && (
              <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                ✓ {formData[doc.key].name}
              </Typography>
            )}
            
            {errors[doc.key] && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors[doc.key]}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const ContactInfoStep = ({ formData, errors, onChange }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Address"
        multiline
        rows={2}
        value={formData.address}
        onChange={(e) => onChange('address', e.target.value)}
        error={!!errors.address}
        helperText={errors.address}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="City"
        value={formData.city}
        onChange={(e) => onChange('city', e.target.value)}
        error={!!errors.city}
        helperText={errors.city}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="State"
        value={formData.state}
        onChange={(e) => onChange('state', e.target.value)}
        error={!!errors.state}
        helperText={errors.state}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="ZIP Code"
        value={formData.zipCode}
        onChange={(e) => onChange('zipCode', e.target.value)}
        error={!!errors.zipCode}
        helperText={errors.zipCode}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Country"
        value={formData.country}
        onChange={(e) => onChange('country', e.target.value)}
        disabled
      />
    </Grid>
  </Grid>
);

const VerificationStep = ({ formData, errors, onChange }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Review & Confirm
    </Typography>
    
    <Alert severity="success" sx={{ mb: 3 }}>
      Great! You're almost done. Please review your information and accept our terms.
    </Alert>
    
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">Personal Details</Typography>
        <Typography variant="body2">
          {formData.firstName} {formData.lastName}<br />
          {formData.email}<br />
          {formData.phoneNumber}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">Business Details</Typography>
        <Typography variant="body2">
          {formData.shopName}<br />
          {formData.businessCategory}<br />
          {formData.businessType}
        </Typography>
      </Grid>
    </Grid>
    
    <Box sx={{ mb: 2 }}>
      <label>
        <input
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={(e) => onChange('acceptTerms', e.target.checked)}
        />
        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
          I accept the <a href="/terms" target="_blank">Terms and Conditions</a>
        </Typography>
      </label>
      {errors.acceptTerms && (
        <Typography variant="caption" color="error" display="block">
          {errors.acceptTerms}
        </Typography>
      )}
    </Box>
    
    <Box sx={{ mb: 2 }}>
      <label>
        <input
          type="checkbox"
          checked={formData.acceptPrivacy}
          onChange={(e) => onChange('acceptPrivacy', e.target.checked)}
        />
        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
          I accept the <a href="/privacy" target="_blank">Privacy Policy</a>
        </Typography>
      </label>
      {errors.acceptPrivacy && (
        <Typography variant="caption" color="error" display="block">
          {errors.acceptPrivacy}
        </Typography>
      )}
    </Box>
  </Box>
);

export default EnhancedSellerRegistration;
