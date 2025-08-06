'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Users, 
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  LogOut,
  BarChart3,
  UserCheck,
  UserX
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  permanent_address: string;
  pin_code: string;
  taluk: string;
  father_name: string;
  mother_name: string;
  education: string;
  occupation: string;
  caste: string;
  complexion: string;
  height: string;
  weight: string;
  siblings_count: string;
  asset_details: string;
  data_verification: boolean;
  payment_utr: string | null;
  payment_status: boolean;
  created_at: string;
  updated_at: string;
}

interface Analytics {
  totalProfiles: number;
  maleCount: number;
  femaleCount: number;
  recentProfiles: number;
  topTaluk: string;
  topEducation: string;
  topOccupation: string;
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterTaluk, setFilterTaluk] = useState('');
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123#') {
      setIsAuthenticated(true);
      toast.success('Login successful!');
      fetchProfiles();
      fetchAnalytics();
    } else {
      toast.error('Invalid credentials!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setProfiles([]);
    setAnalytics(null);
    toast.success('Logged out successfully!');
  };

  // Fetch data
  const fetchProfiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/profiles');
      setProfiles(response.data);
      setFilteredProfiles(response.data);
    } catch (error) {
      toast.error('Failed to fetch profiles');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:8000/profiles');
      const data = response.data;
      
      const analytics: Analytics = {
        totalProfiles: data.length,
        maleCount: data.filter((p: Profile) => p.gender === 'male').length,
        femaleCount: data.filter((p: Profile) => p.gender === 'female').length,
        recentProfiles: data.filter((p: Profile) => {
          const createdDate = new Date(p.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length,
        topTaluk: getMostFrequent(data, 'taluk'),
        topEducation: getMostFrequent(data, 'education'),
        topOccupation: getMostFrequent(data, 'occupation')
      };
      
      setAnalytics(analytics);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    }
  };

  const getMostFrequent = (data: Profile[], field: keyof Profile): string => {
    const counts: { [key: string]: number } = {};
    data.forEach(item => {
      const value = item[field] as string;
      counts[value] = (counts[value] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(counts));
    const mostFrequent = Object.keys(counts).find(key => counts[key] === maxCount);
    return mostFrequent || 'N/A';
  };

  // Filtering and searching
  useEffect(() => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.father_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.mother_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.taluk.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterGender) {
      filtered = filtered.filter(profile => profile.gender === filterGender);
    }

    if (filterTaluk) {
      filtered = filtered.filter(profile => profile.taluk === filterTaluk);
    }

    setFilteredProfiles(filtered);
  }, [profiles, searchTerm, filterGender, filterTaluk]);

  // Edit profile
  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setShowEditModal(true);
  };

  const handleUpdateProfile = async (updatedProfile: Profile) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:8000/profiles/${updatedProfile.id}`, updatedProfile);
      toast.success('Profile updated successfully!');
      fetchProfiles();
      setShowEditModal(false);
      setEditingProfile(null);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Delete profile
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await axios.delete(`http://localhost:8000/profiles/${id}`);
        toast.success('Profile deleted successfully!');
        fetchProfiles();
        fetchAnalytics();
      } catch (error) {
        toast.error('Failed to delete profile');
      }
    }
  };

  // Export data
  const exportData = () => {
    const csvContent = [
      ['ID', 'Name', 'Gender', 'DOB', 'Address', 'PIN', 'Taluk', 'Father', 'Mother', 'Education', 'Occupation', 'Caste', 'Complexion', 'Height', 'Weight', 'Siblings', 'Assets', 'Created At'],
      ...filteredProfiles.map(p => [
        p.id, p.full_name, p.gender, p.date_of_birth, p.permanent_address, p.pin_code,
        p.taluk, p.father_name, p.mother_name, p.education, p.occupation, p.caste,
        p.complexion, p.height, p.weight, p.siblings_count, p.asset_details, p.created_at
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadi_broker_profiles_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center"
        style={{ backgroundImage: 'url(/bg.png)' }}
      >
              <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img 
              src="/logo.png" 
              alt="Shadi Broker Logo" 
              className="w-24 h-24 mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Shadi Broker</h1>
          <p className="text-black">Admin Portal</p>
        </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Shadi Broker Logo" 
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-2xl font-bold text-black">Shadi Broker Admin</h1>
              <p className="text-sm text-black">Profile Management Portal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalProfiles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Male Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.maleCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Female Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.femaleCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.recentProfiles}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, father, mother, or taluk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                />
              </div>
            </div>
            
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            
            <select
              value={filterTaluk}
              onChange={(e) => setFilterTaluk(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            >
              <option value="">All Taluks</option>
              {Array.from(new Set(profiles.map(p => p.taluk))).map(taluk => (
                <option key={taluk} value={taluk}>{taluk}</option>
              ))}
            </select>
            
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
          
          {/* View Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                Grid View
              </button>
            </div>
            <span className="text-black font-medium">
              {filteredProfiles.length} profiles found
            </span>
          </div>
        </div>

        {/* Profiles Display */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">
                Profiles Table View
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">DOB</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Father</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Mother</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Taluk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">PIN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Education</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Occupation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Caste</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Complexion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Height</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Siblings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfiles.map((profile) => {
                    const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear();
                    return (
                      <tr key={profile.id} className="hover:bg-gray-50">
                                              <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{profile.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          profile.gender === 'male' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {profile.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.date_of_birth}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.father_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.mother_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.taluk}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.pin_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.education}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.occupation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.caste}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.complexion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.height}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.weight}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{profile.siblings_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          profile.payment_status 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {profile.payment_status ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(profile)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(profile.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="px-6 py-4 border-b border-gray-200 mb-6">
              <h2 className="text-lg font-semibold text-black">
                Profiles Grid View
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => {
                const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear();
                return (
                  <div key={profile.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-1">{profile.full_name}</h3>
                        <p className="text-sm text-black">{profile.father_name}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.gender === 'male' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {profile.gender}
                      </span>
                    </div>
                    
                                         <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Age:</span>
                         <span className="text-black">{age}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">DOB:</span>
                         <span className="text-black">{profile.date_of_birth}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Father:</span>
                         <span className="text-black">{profile.father_name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Mother:</span>
                         <span className="text-black">{profile.mother_name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Taluk:</span>
                         <span className="text-black">{profile.taluk}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">PIN Code:</span>
                         <span className="text-black">{profile.pin_code}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Education:</span>
                         <span className="text-black">{profile.education}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Occupation:</span>
                         <span className="text-black">{profile.occupation}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Caste:</span>
                         <span className="text-black">{profile.caste}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Complexion:</span>
                         <span className="text-black">{profile.complexion}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Height:</span>
                         <span className="text-black">{profile.height}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Weight:</span>
                         <span className="text-black">{profile.weight}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Siblings:</span>
                         <span className="text-black">{profile.siblings_count}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Payment Status:</span>
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           profile.payment_status 
                             ? 'bg-green-100 text-green-800' 
                             : 'bg-red-100 text-red-800'
                         }`}>
                           {profile.payment_status ? 'Paid' : 'Unpaid'}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Created:</span>
                         <span className="text-black">{new Date(profile.created_at).toLocaleDateString()}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-black font-medium">Updated:</span>
                         <span className="text-black">{new Date(profile.updated_at).toLocaleDateString()}</span>
                       </div>
                     </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-black">
                        <span className="font-medium">Address:</span> {profile.permanent_address}
                      </div>
                      <div className="text-sm text-black mt-2">
                        <span className="font-medium">Asset Details:</span> {profile.asset_details}
                      </div>
                      {profile.payment_utr && (
                        <div className="text-sm text-black mt-2">
                          <span className="font-medium">Payment UTR:</span> {profile.payment_utr}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleEdit(profile)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Edit size={14} className="inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 size={14} className="inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-red-500">Edit Profile</h3>
            <EditProfileForm
              profile={editingProfile}
              onSave={handleUpdateProfile}
              onCancel={() => setShowEditModal(false)}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Profile Form Component
function EditProfileForm({ 
  profile, 
  onSave, 
  onCancel, 
  loading 
}: { 
  profile: Profile; 
  onSave: (profile: Profile) => void; 
  onCancel: () => void; 
  loading: boolean;
}) {
  const [formData, setFormData] = useState(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold text-black mb-4">Edit Profile - {formData.full_name}</h3>
      
      {/* Personal Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-black mb-3">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Height</label>
            <input
              type="text"
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Weight</label>
            <input
              type="text"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Complexion</label>
            <input
              type="text"
              value={formData.complexion}
              onChange={(e) => handleChange('complexion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
        </div>
      </div>

      {/* Family Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-black mb-3">Family Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Father's Name</label>
            <input
              type="text"
              value={formData.father_name}
              onChange={(e) => handleChange('father_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Mother's Name</label>
            <input
              type="text"
              value={formData.mother_name}
              onChange={(e) => handleChange('mother_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Number of Siblings</label>
            <input
              type="number"
              value={formData.siblings_count}
              onChange={(e) => handleChange('siblings_count', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Caste</label>
            <input
              type="text"
              value={formData.caste}
              onChange={(e) => handleChange('caste', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-black mb-3">Address Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Taluk</label>
            <input
              type="text"
              value={formData.taluk}
              onChange={(e) => handleChange('taluk', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">PIN Code</label>
            <input
              type="text"
              value={formData.pin_code}
              onChange={(e) => handleChange('pin_code', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-black mb-1">Permanent Address</label>
          <textarea
            value={formData.permanent_address}
            onChange={(e) => handleChange('permanent_address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            required
          />
        </div>
      </div>

      {/* Education & Occupation */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-black mb-3">Education & Occupation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Education</label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => handleChange('education', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              required
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-black mb-1">Asset Details</label>
          <textarea
            value={formData.asset_details}
            onChange={(e) => handleChange('asset_details', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            required
          />
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-black mb-3">Payment Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Payment Status</label>
            <select
              value={formData.payment_status.toString()}
              onChange={(e) => handleChange('payment_status', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            >
              <option value="false">Unpaid</option>
              <option value="true">Paid</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Payment UTR Number</label>
            <input
              type="text"
              value={formData.payment_utr || ''}
              onChange={(e) => handleChange('payment_utr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              placeholder="Enter UTR number if paid"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 