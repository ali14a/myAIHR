import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext.js';
import { useNotification } from '@contexts/NotificationContext.js';
import { profileService } from '@profile/services';
import {
  UserIcon,
  PhotoIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useNotification();
  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.first_name ?? '',
        email: user.email ?? '',
        phone: user.mobile_number ?? '',
        location: user.location ?? '',
        bio: user.bio ?? ''
      });
      setImagePreview(user.profile_photo || null);
    }
  }, [user]);

  // Show loading state if user is not available yet
  if (!user) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateProfile();
  };

  const updateProfile = async () => {
    setLoading(true);

    try {
      const updateData = { 
        first_name: formData.name,
        last_name: undefined,
        mobile_number: formData.phone,
        company: undefined,
        job_title: undefined,
        location: formData.location,
        bio: formData.bio
      };
      
      // Upload profile photo if selected
      if (profileImage) {
        await profileService.uploadProfilePhoto(profileImage);
      }

      // Update profile data
      await profileService.updateProfile(updateData);
      
      // Get updated user data from server to ensure we have the latest info
      const updatedUserResponse = await profileService.getProfile();
      
      // Update the user data in AuthContext with the fresh data from server
      if (updatedUserResponse.user) {
        updateUser(updatedUserResponse.user);
      }
      
      success('Profile updated successfully!');
      setEditing(false);
      setProfileImage(null);
    } catch (err: any) {
      console.error('Profile update error:', err);
      if (err.response?.status === 401) {
        error('Session expired. Please log in again.');
        // Redirect to login
        window.location.href = '/login';
      } else {
        error('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.first_name ?? '',
        email: user.email ?? '',
        phone: user.mobile_number ?? '',
        location: user.location ?? '',
        bio: user.bio ?? ''
      });
      setImagePreview(user.profile_photo || null);
    }
    setProfileImage(null);
    setEditing(false);
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto space-y-6 py-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Image */}
        <div className="lg:col-span-1">
          <div className="card text-center bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <div className="relative inline-block">
              <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-16 w-16 text-gray-400" />
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700">
                  <PhotoIcon className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900">{user?.first_name || 'User'}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                      <button
                      onClick={updateProfile}
                        type="button"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`form-input ${!editing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`form-input ${!editing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`form-input ${!editing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div>
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`form-input ${!editing ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'bg-gray-50' : ''}`}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-sm text-gray-500">Resumes Uploaded</div>
        </div>
        <div className="card text-center bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-sm text-gray-500">Cover Letters Generated</div>
        </div>
        <div className="card text-center bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <div className="text-2xl font-bold text-purple-600">24</div>
          <div className="text-sm text-gray-500">Job Matches Analyzed</div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="card bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive updates about your resume analysis</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="sr-only">Toggle email notifications</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
              <p className="text-sm text-gray-500">Receive tips and updates about our services</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="sr-only">Toggle marketing emails</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Data Privacy</h3>
              <p className="text-sm text-gray-500">Manage your data and privacy settings</p>
            </div>
            <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
              Manage
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;
