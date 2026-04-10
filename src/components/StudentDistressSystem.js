import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  UserIcon,
  BellIcon,
  CheckCircleIcon,
  EyeIcon,
  XMarkIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StudentDistressSystem = ({ user }) => {
  const [distressAlerts, setDistressAlerts] = useState([]);
  const [studentComplaints, setStudentComplaints] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [interventionHistory, setInterventionHistory] = useState([]);

  useEffect(() => {
    loadDistressData();
  }, []);

  const loadDistressData = () => {
    // Load all complaints
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    setStudentComplaints(allComplaints);
    
    // Analyze for distress patterns
    const distressAnalysis = analyzeDistressPatterns(allComplaints);
    setDistressAlerts(distressAnalysis.alerts);
    
    // Load intervention history
    const history = JSON.parse(localStorage.getItem('interventions') || '[]');
    setInterventionHistory(history);
  };

  const analyzeDistressPatterns = (complaints) => {
    const alerts = [];
    const studentGroups = {};
    
    // Group complaints by student
    complaints.forEach(complaint => {
      const studentId = complaint.studentId || complaint.email;
      if (!studentGroups[studentId]) {
        studentGroups[studentId] = [];
      }
      studentGroups[studentId].push(complaint);
    });
    
    // Analyze each student's complaint pattern
    Object.entries(studentGroups).forEach(([studentId, studentComplaints]) => {
      const analysis = analyzeStudentComplaints(studentComplaints);
      
      if (analysis.needsIntervention) {
        alerts.push({
          id: `ALERT_${Date.now()}_${studentId}`,
          studentId,
          studentName: studentComplaints[0]?.studentName || 'Unknown Student',
          riskLevel: analysis.riskLevel,
          complaintCount: analysis.complaintCount,
          timeFrame: analysis.timeFrame,
          categories: analysis.categories,
          severity: analysis.severity,
          recommendations: analysis.recommendations,
          createdAt: new Date().toISOString(),
          status: 'active'
        });
      }
    });
    
    return { alerts };
  };

  const analyzeStudentComplaints = (complaints) => {
    const sortedComplaints = complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const now = new Date();
    
    // Count complaints in different time frames
    const last7Days = sortedComplaints.filter(c => (now - new Date(c.createdAt)) / (1000 * 60 * 60 * 24) <= 7);
    const last30Days = sortedComplaints.filter(c => (now - new Date(c.createdAt)) / (1000 * 60 * 60 * 24) <= 30);
    const last90Days = sortedComplaints.filter(c => (now - new Date(c.createdAt)) / (1000 * 60 * 60 * 24) <= 90);
    
    const complaintCount = complaints.length;
    const categories = [...new Set(complaints.map(c => c.category))];
    const severityScore = complaints.reduce((acc, c) => {
      const score = c.priority === 'critical' ? 4 : c.priority === 'urgent' ? 3 : c.priority === 'normal' ? 2 : 1;
      return acc + score;
    }, 0);
    
    // Determine risk level
    let riskLevel = 'low';
    let needsIntervention = false;
    let recommendations = [];
    
    if (last7Days.length >= 3) {
      riskLevel = 'critical';
      needsIntervention = true;
      recommendations = [
        'Immediate counseling intervention required',
        'Schedule welfare department meeting',
        'Consider temporary academic support',
        'Monitor for signs of severe distress'
      ];
    } else if (last30Days.length >= 5) {
      riskLevel = 'high';
      needsIntervention = true;
      recommendations = [
        'Schedule counseling session within 48 hours',
        'Contact student support services',
        'Review academic load and stress factors',
        'Consider peer support group referral'
      ];
    } else if (last90Days.length >= 8) {
      riskLevel = 'medium';
      needsIntervention = true;
      recommendations = [
        'Schedule routine check-in with counselor',
        'Monitor academic performance',
        'Provide wellness resources',
        'Consider stress management workshop'
      ];
    } else if (complaintCount >= 3 && categories.length >= 4) {
      riskLevel = 'medium';
      needsIntervention = true;
      recommendations = [
        'Multi-faceted support recommended',
        'Cross-departmental coordination needed',
        'Comprehensive assessment advised'
      ];
    }
    
    return {
      complaintCount,
      timeFrame: last90Days.length > 0 ? '90 days' : last30Days.length > 0 ? '30 days' : '7 days',
      categories,
      severity: severityScore / complaintCount,
      riskLevel,
      needsIntervention,
      recommendations
    };
  };

  const createIntervention = (alertId) => {
    const alert = distressAlerts.find(a => a.id === alertId);
    if (!alert) return;
    
    const intervention = {
      id: `INTV_${Date.now()}`,
      alertId: alert.id,
      studentId: alert.studentId,
      studentName: alert.studentName,
      type: 'counseling_referral',
      status: 'scheduled',
      assignedTo: 'Student Welfare Department',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Automatic distress alert intervention',
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };
    
    const updatedHistory = [...interventionHistory, intervention];
    setInterventionHistory(updatedHistory);
    localStorage.setItem('interventions', JSON.stringify(updatedHistory));
    
    // Update alert status
    const updatedAlerts = distressAlerts.map(a => 
      a.id === alertId ? { ...a, status: 'intervention_initiated', updatedAt: new Date().toISOString() } : a
    );
    setDistressAlerts(updatedAlerts);
    localStorage.setItem('distressAlerts', JSON.stringify(updatedAlerts));
  };

  const dismissAlert = (alertId) => {
    const updatedAlerts = distressAlerts.map(a => 
      a.id === alertId ? { ...a, status: 'dismissed', updatedAt: new Date().toISOString() } : a
    );
    setDistressAlerts(updatedAlerts);
    localStorage.setItem('distressAlerts', JSON.stringify(updatedAlerts));
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeAlerts = distressAlerts.filter(a => a.status === 'active');
  const interventionAlerts = distressAlerts.filter(a => a.status === 'intervention_initiated');

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Student Welfare System</h1>
            <p className='text-gray-600'>Early warning and intervention tracking</p>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <ExclamationTriangleIcon className='h-6 w-6 text-red-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Active Alerts</dt>
                    <dd className='text-lg font-medium text-gray-900'>{activeAlerts.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <BellIcon className='h-6 w-6 text-yellow-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Interventions</dt>
                    <dd className='text-lg font-medium text-gray-900'>{interventionHistory.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <UserIcon className='h-6 w-6 text-blue-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Students Monitored</dt>
                    <dd className='text-lg font-medium text-gray-900'>{studentComplaints.filter(c => c.studentId).length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <ChartBarIcon className='h-6 w-6 text-green-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Total Complaints</dt>
                    <dd className='text-lg font-medium text-gray-900'>{studentComplaints.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className='bg-white overflow-hidden shadow rounded-lg mb-8'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>Active Distress Alerts</h3>
            
            {activeAlerts.length === 0 ? (
              <div className='text-center py-8'>
                <CheckCircleIcon className='mx-auto h-12 w-12 text-green-400 mb-3' />
                <p className='text-gray-500'>No active distress alerts</p>
                <p className='text-sm text-gray-400 mt-2'>All students appear to be within normal parameters</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className={`border-l-4 p-4 rounded-lg ${getRiskLevelColor(alert.riskLevel)}`}>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center mb-2'>
                          <UserIcon className='h-5 w-5 text-gray-600 mr-2' />
                          <div>
                            <p className='font-medium text-gray-900'>{alert.studentName}</p>
                            <p className='text-sm text-gray-600'>Student ID: {alert.studentId}</p>
                          </div>
                        </div>
                        
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>Risk Level</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(alert.riskLevel)}`}>
                              {alert.riskLevel.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>Complaints</p>
                            <p className='text-sm text-gray-900'>{alert.complaintCount} in {alert.timeFrame}</p>
                          </div>
                        </div>
                        
                        <div className='mb-3'>
                          <p className='text-sm font-medium text-gray-700'>Categories</p>
                          <div className='flex flex-wrap gap-2'>
                            {alert.categories.map((category, index) => (
                              <span key={index} className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className='text-sm font-medium text-gray-700 mb-2'>Recommendations</p>
                          <ul className='list-disc list-inside space-y-1 text-sm text-gray-600'>
                            {alert.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className='flex flex-col space-y-2 ml-4'>
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className='text-blue-600 hover:text-blue-900 text-sm'
                        >
                          <EyeIcon className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => createIntervention(alert.id)}
                          className='text-green-600 hover:text-green-900 text-sm'
                        >
                          <CheckCircleIcon className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className='text-red-600 hover:text-red-900 text-sm'
                        >
                          <XMarkIcon className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Intervention History */}
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>Intervention History</h3>
            
            {interventionHistory.length === 0 ? (
              <div className='text-center py-8'>
                <CalendarIcon className='mx-auto h-12 w-12 text-gray-400 mb-3' />
                <p className='text-gray-500'>No interventions recorded</p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Student
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Type
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Scheduled Date
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {interventionHistory.map((intervention) => (
                      <tr key={intervention.id}>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>{intervention.studentName}</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {intervention.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900'>
                            {new Date(intervention.scheduledDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            {intervention.status.replace('_', ' ').toUpperCase()}
                          </span>
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

export default StudentDistressSystem;
