import {
  Box,
  Button,
  FormControlLabel,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  InputAdornment,
  Avatar,
  IconButton,
} from "@mui/material";

import { useState, useRef } from "react";
import { styled, alpha } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 6),
  maxWidth: 800,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  '& .MuiGrid-container': {
    maxWidth: '100%',
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: theme.spacing(4),
  color: theme.palette.primary.main,
  textAlign: 'center',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1, 3),
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  '& .MuiFormControlLabel-root': {
    marginRight: theme.spacing(4),
  },
}));

const PhotoUploadArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
  },
}));

const defaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  gender: "",
  status: "Active",
  location: "",
  profileImage: null,
};

const UserForm = ({
  initialValues,
  mode = "create",
  onSubmit,
  submitting,
}) => {
  const [previewImage, setPreviewImage] = useState(
    initialValues?.profileImage || null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { ...defaultValues, ...initialValues },
  });

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Validate file type
    if (!file.type.match('image.*')) {
      console.error('Selected file is not an image');
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (e.g., 2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      console.error('File is too large:', file.size, 'bytes');
      alert('File size must be less than 2MB');
      return;
    }

    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // Set the file in the form data
    setValue("profileImage", file, { 
      shouldDirty: true, 
      shouldValidate: true 
    });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('File preview generated');
      setPreviewImage(e.target.result);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      alert('Error reading the selected file');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setValue("profileImage", null);
    setPreviewImage(null);
  };

  const submit = async (data) => {
    console.log('Form submission started with data:', data);
    
    const formData = new FormData();
    
    // First, append all non-file fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'profileImage' && value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });
    
    // Then handle the file separately
    if (data.profileImage && data.profileImage instanceof File) {
      console.log('Appending file to form data:', data.profileImage.name);
      formData.append('profileImage', data.profileImage);
    } else if (data.profileImage) {
      console.warn('Profile image is not a File object:', data.profileImage);
    }
    
    // Debug: Log all form data entries
    console.log('=== Form Data Entries ===');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }
    console.log('=========================');
    
    // Verify the file is properly included
    if (data.profileImage) {
      if (data.profileImage instanceof File) {
        console.log('File is ready for upload:', data.profileImage.name);
      } else {
        console.warn('Profile image is not a File object');
      }
    } else {
      console.log('No profile image to upload');
    }

    try {
      // Ensure we're passing the raw form data
      await onSubmit(formData);
    } catch (error) {
      console.error('Error in form submission:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  return (
    <StyledPaper component="form" noValidate onSubmit={handleSubmit(submit)}>
      <FormTitle>
        {mode === "edit" ? "Update User Details" : "Register New User"}
      </FormTitle>

      {/* ======================= PROFILE IMAGE UPLOAD ======================= */}
      <Grid container justifyContent="center" mb={4}>
        <Grid item xs={12} md={6} lg={5}>
          <Box 
            component="label"
            htmlFor="profile-image-upload"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 3,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Box sx={{ position: 'relative', mb: 2, textAlign: 'center' }}>
              <Avatar
                src={previewImage}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  bgcolor: 'primary.light',
                  mb: 2,
                  border: '2px solid',
                  borderColor: 'divider',
                }}
              >
                <PersonIcon sx={{ fontSize: 60, color: 'white' }} />
              </Avatar>
              
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                hidden
                id="profile-image-upload"
                name="profileImage"
                ref={fileInputRef}
              />
              
              <Button
                component="span"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 1 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                {previewImage ? 'Change Photo' : 'UPLOAD PHOTO'}
              </Button>
              
              <Typography variant="caption" color="text.secondary" display="block">
                JPG / PNG (max 2MB)
              </Typography>
              
              {previewImage && (
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeImage();
                  }}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <CancelIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* ======================= NAME FIELDS ======================= */}
      <Grid container spacing={3} mb={2} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <StyledTextField
            fullWidth
            label="First Name"
            variant="outlined"
            {...register("firstName", { required: "First name is required" })}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color={errors.firstName ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={8} lg={6}>
          <StyledTextField
            fullWidth
            label="Last Name"
            variant="outlined"
            {...register("lastName", { required: "Last name is required" })}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color={errors.lastName ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      {/* ======================= CONTACT FIELDS ======================= */}
      <Grid container spacing={3} mb={2} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <StyledTextField
            fullWidth
            label="Email"
            variant="outlined"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: "Invalid email address",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color={errors.email ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={8} lg={6}>
          <StyledTextField
            fullWidth
            label="Mobile"
            variant="outlined"
            {...register("mobile", {
              required: "Mobile number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10-digit mobile number",
              },
            })}
            error={!!errors.mobile}
            helperText={errors.mobile?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color={errors.mobile ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      {/* ======================= GENDER & STATUS ======================= */}
      <Grid container spacing={3} mb={2} justifyContent="center">
        {/* Gender */}
        <Grid item xs={12} md={8} lg={6}>
          <Box
            sx={{
              border: `1px solid ${errors.gender ? 'error.main' : 'rgba(0, 0, 0, 0.23)'}`,
              borderRadius: 1,
              p: 2,
              '&:hover': {
                borderColor: errors.gender ? 'error.main' : 'text.primary',
              },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Gender *
            </Typography>

            <StyledRadioGroup row {...register("gender", { required: "Please select a gender" })}>
              <FormControlLabel 
                value="Male" 
                control={
                  <Radio 
                    icon={<MaleIcon />} 
                    checkedIcon={<MaleIcon color="primary" />} 
                  />
                } 
                label="Male" 
                sx={{ mr: 4 }}
              />
              <FormControlLabel 
                value="Female" 
                control={
                  <Radio 
                    icon={<FemaleIcon />} 
                    checkedIcon={<FemaleIcon color="secondary" />} 
                  />
                } 
                label="Female" 
              />
            </StyledRadioGroup>

            {errors.gender && (
              <FormHelperText error sx={{ mt: 0.5, ml: 2 }}>
                {errors.gender.message}
              </FormHelperText>
            )}
          </Box>
        </Grid>

        {/* Status */}
        <Grid item xs={12} md={8} lg={6}>
          <Box
            sx={{
              border: `1px solid ${errors.status ? 'error.main' : 'rgba(0, 0, 0, 0.23)'}`,
              borderRadius: 1,
              p: 2,
              '&:hover': {
                borderColor: errors.status ? 'error.main' : 'text.primary',
              },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Status *
            </Typography>

            <StyledRadioGroup row {...register("status", { required: "Please select a status" })}>
              <FormControlLabel 
                value="Active" 
                control={
                  <Radio 
                    icon={<CheckCircleIcon />} 
                    checkedIcon={<CheckCircleIcon color="success" />} 
                  />
                } 
                label="Active"
                sx={{ mr: 4 }}
              />
              <FormControlLabel 
                value="Inactive" 
                control={
                  <Radio 
                    icon={<CancelIcon />} 
                    checkedIcon={<CancelIcon color="error" />} 
                  />
                } 
                label="Inactive" 
              />
            </StyledRadioGroup>
            
            {errors.status && (
              <FormHelperText error sx={{ mt: 0.5, ml: 2 }}>
                {errors.status.message}
              </FormHelperText>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* ======================= LOCATION ======================= */}
      <Grid container spacing={3} mb={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <StyledTextField
            fullWidth
            label="Location"
            variant="outlined"
            {...register("location", { required: "Location is required" })}
            error={!!errors.location}
            helperText={errors.location?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color={errors.location ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      {/* ======================= ACTIONS ======================= */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        mt: 4, 
        gap: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 3,
      }}>
        <StyledButton
          variant="outlined"
          onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}
          disabled={submitting}
          sx={{
            borderColor: 'error.main',
            color: 'error.main',
            '&:hover': {
              borderColor: 'error.dark',
              backgroundColor: 'rgba(211, 47, 47, 0.04)',
            },
          }}
        >
          CANCEL
        </StyledButton>

        <StyledButton
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={
            submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
          sx={{
            bgcolor: 'primary.dark',
            '&:hover': {
              bgcolor: 'primary.main',
            },
          }}
        >
          {submitting ? "SAVING..." : "SAVE"}
        </StyledButton>
      </Box>
    </StyledPaper>
  );
};

export default UserForm;
