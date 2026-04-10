import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MediationModule = ({ user }) => {
  const [mediations, setMediations] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMediation, setSelectedMediation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complaintId: '',
    studentId: '',
    authorityId: '',
    scheduledDate: '',
    scheduledTime: '',
    location: '',
    type: 'in_person'
  });

  useEffect(() => {
    loadMediations();
  }, []);

  const loadMediations = () => {
    const allMediations = JSON.parse(localStorage.getItem('mediations') || '[]');
    setMediations(allMediations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMediation = {
        ...formData,
        id: `MED_${Date.now()}`,
        status: 'scheduled',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedMediations = [...mediations, newMediation];
      setMediations(updatedMediations);
      localStorage.setItem('mediations', JSON.stringify(updatedMediations));
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        complaintId: '',
        studentId: '',
        authorityId: '',
        scheduledDate: '',
        scheduledTime: '',
        location: '',
        type: 'in_person'
      });
      setShowCreateForm(false);
      
    } catch (error) {
      console.error('Error creating mediation:', error);
    }
  };

  const updateMediationStatus = (mediationId, newStatus) => {
    const updatedMediations = mediations.map(m => 
      m.id === mediationId ? { ...m, status: newStatus, updatedAt: new Date().toISOString() } : m
    );
    
    setMediations(updatedMediations);
    localStorage.setItem('mediations', JSON.stringify(updatedMediations));
  };

  const deleteMediation = (mediationId) => {
    const updatedMediations = mediations.filter(m => m.id !== mediationId);
    setMediations(updatedMediations);
    localStorage.setItem('mediations', JSON.stringify(updatedMediations));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingMediations = mediations.filter(m => m.status === 'scheduled');
  const inProgressMediations = mediations.filter(m => m.status === 'in_progress');
  const completedMediations = mediations.filter(m => m.status === 'completed');

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Mediation Module</h1>
            <p className='text-gray-600'>Manage dispute resolution sessions</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
          >
            <PlusIcon className='h-4 w-4 mr-2' />
            Schedule Mediation
          </button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <CalendarIcon className='h-6 w-6 text-blue-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Upcoming</dt>
                    <dd className='text-lg font-medium text-gray-900'>{upcomingMediations.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <ClockIcon className='h-6 w-6 text-yellow-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>In Progress</dt>
                    <dd className='text-lg font-medium text-gray-900'>{inProgressMediations.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <CheckCircleIcon className='h-6 w-6 text-green-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Completed</dt>
                    <dd className='text-lg font-medium text-gray-900'>{completedMediations.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <DocumentTextIcon className='h-6 w-6 text-gray-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Total Sessions</dt>
                    <dd className='text-lg font-medium text-gray-900'>{mediations.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Mediation Form Modal */}
        {showCreateForm && (
          <div className='fixed inset-0 z-50 overflow-y-auto'>
            <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
              <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
                <div className='absolute inset-0 bg-gray-500 opacity-75'></div>
              </div>
              
              <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full'>
                <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                  <div className='sm:flex sm:items-start'>
                    <div className='w-full'>
                      <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                        Schedule New Mediation Session
                      </h3>
                      
                      <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700'>Title</label>
                            <input
                              type='text'
                              value={formData.title}
                              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                              required
                            />
                          </div>
                          
                          <div>
                            <label className='block text-sm font-medium text-gray-700'>Complaint ID</label>
                            <input
                              type='text'
                              value={formData.complaintId}
                              onChange={(e) => setFormData(prev => ({ ...prev, complaintId: e.target.value }))}
                              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                              required
                            />
                          </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700'>Student ID</label>
                            <input
                              type='text'
                              value={formData.studentId}
                              onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                              required
                            />
                          </div>
                          
                          <div>
                            <label className='block text-sm font-medium text-gray-700'>Authority ID</label>
                            <input
                              type='text'
                              value={formData.authorityId}
                              onChange={(e) => setFormData(prev => ({ ...prev, authorityId: e.target.value }))}
                              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                              required
                            />
                          </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700'>Date</label>
                            <input
                              type='date'
                              value={formData.scheduledDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                              required
                            />
                          </div>
                          
                          <div>
                            <label className='block text-sm font-medium text-gray-700'>Time</label>
                            <input
                              type='time'
                              value={formData.scheduledTime}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700'>Location</label>
                          <input
                            type='text'
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                            placeholder='Meeting room or location'
                            required
                          />
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700'>Type</label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                          >
                            <option value='in_person'>In Person</option>
                            <option value='virtual'>Virtual</option>
                            <option value='hybrid'>Hybrid</option>
                          </select>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700'>Description</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                            placeholder='Mediation session details and agenda'
                          />
                        </div>
                      </form>
                      
                      <div className='mt-6 sm:flex sm:flex-row-reverse'>
                        <button
                          type='button'
                          onClick={() => setShowCreateForm(false)}
                          className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm'
                        >
                          Cancel
                        </button>
                        <button
                          type='submit'
                          className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm'
                        >
                          Schedule Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mediations List */}
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>Mediation Sessions</h3>
            
            {mediations.length === 0 ? (
              <div className='text-center py-8'>
                <CalendarIcon className='mx-auto h-12 w-12 text-gray-400 mb-3' />
                <p className='text-gray-500'>No mediation sessions scheduled</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className='mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
                >
                  Schedule First Session
                </button>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Title
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Date & Time
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Location
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {mediations.map((mediation) => (
                      <tr key={mediation.id}>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>{mediation.title}</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900'>
                            {new Date(mediation.scheduledDate).toLocaleDateString()} at {mediation.scheduledTime}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900'>{mediation.location}</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mediation.status)}`}>
                            {mediation.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => setSelectedMediation(mediation)}
                              className='text-blue-600 hover:text-blue-900'
                            >
                              <UserIcon className='h-4 w-4' />
                            </button>
                            {mediation.status === 'scheduled' && (
                              <button
                                onClick={() => updateMediationStatus(mediation.id, 'in_progress')}
                                className='text-green-600 hover:text-green-900'
                              >
                                <ClockIcon className='h-4 w-4' />
                              </button>
                            )}
                            {mediation.status === 'in_progress' && (
                              <button
                                onClick={() => updateMediationStatus(mediation.id, 'completed')}
                                className='text-green-600 hover:text-green-900'
                              >
                                <CheckCircleIcon className='h-4 w-4' />
                              </button>
                            )}
                            <button
                              onClick={() => deleteMediation(mediation.id)}
                              className='text-red-600 hover:text-red-900'
                            >
                              <XMarkIcon className='h-4 w-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediationModule;
