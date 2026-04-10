import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  BellIcon,
  ChartBarIcon,
  FunnelIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const EscalationEngine = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [autoEscalations, setAutoEscalations] = useState([]);
  const [mlSettings, setMlSettings] = useState({
    enabled: true,
    threshold: 0.7,
    factors: ['department_performance', 'repeat_complainant', 'severity', 'time_overdue']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    setComplaints(allComplaints);
    
    // Analyze for escalations
    const escalationAnalysis = analyzeEscalations(allComplaints);
    setEscalations(escalationAnalysis.escalations);
    setAutoEscalations(escalationAnalysis.autoEscalations);
  };

  const analyzeEscalations = (complaints) => {
    const escalations = [];
    const autoEscalations = [];
    
    complaints.forEach(complaint => {
      const analysis = evaluateEscalationRules(complaint, complaints);
      
      if (analysis.shouldEscalate) {
        const escalation = {
          id: `ESC_${Date.now()}_${complaint.id}`,
          complaintId: complaint.id,
          originalPriority: complaint.priority,
          escalatedPriority: analysis.recommendedPriority,
          reason: analysis.reason,
          confidence: analysis.confidence,
          factors: analysis.factors,
          status: 'pending_review',
          createdAt: new Date().toISOString(),
          reviewedBy: null,
          approvedBy: null,
          type: analysis.type
        };
        
        escalations.push(escalation);
        
        if (analysis.type === 'automatic') {
          autoEscalations.push(escalation);
        }
      }
    });
    
    return { escalations, autoEscalations };
  };

  const evaluateEscalationRules = (complaint, allComplaints) => {
    const rules = [];
    let shouldEscalate = false;
    let recommendedPriority = complaint.priority;
    let reason = '';
    let confidence = 0.5;
    let type = 'manual';
    const factors = [];
    
    // Rule 1: Department Performance Check
    if (mlSettings.factors.includes('department_performance')) {
      const deptPerformance = calculateDepartmentPerformance(complaint.assignedDepartment, allComplaints);
      
      if (deptPerformance.avgResolutionTime > 7) {
        rules.push({
          rule: 'Department Performance',
          condition: `Avg resolution time: ${deptPerformance.avgResolutionTime.toFixed(1)} days`,
          impact: 'Poor performance detected'
        });
        shouldEscalate = true;
        confidence += 0.2;
        factors.push('department_performance');
      }
    }
    
    // Rule 2: Repeat Complainant Check
    if (mlSettings.factors.includes('repeat_complainant')) {
      const studentComplaints = allComplaints.filter(c => c.studentId === complaint.studentId);
      const recentComplaints = studentComplaints.filter(c => {
        const daysDiff = (new Date(complaint.createdAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);
        return Math.abs(daysDiff) <= 30 && c.id !== complaint.id;
      });
      
      if (recentComplaints.length >= 3) {
        rules.push({
          rule: 'Repeat Complainant',
          condition: `${recentComplaints.length} complaints in 30 days`,
          impact: 'Pattern of repeated grievances'
        });
        shouldEscalate = true;
        confidence += 0.25;
        factors.push('repeat_complainant');
        
        if (recommendedPriority !== 'critical') {
          recommendedPriority = 'urgent';
        }
      }
    }
    
    // Rule 3: Severity Check
    if (mlSettings.factors.includes('severity') && complaint.priority === 'critical') {
      rules.push({
        rule: 'Critical Severity',
        condition: 'Complaint marked as critical',
        impact: 'High priority issue requiring immediate attention'
      });
      shouldEscalate = true;
      confidence += 0.3;
      factors.push('severity');
      
      if (recommendedPriority !== 'critical') {
        recommendedPriority = 'critical';
      }
    }
    
    // Rule 4: Time Overdue Check
    if (mlSettings.factors.includes('time_overdue')) {
      const daysOverdue = (new Date() - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24);
      
      if (daysOverdue > 14 && complaint.status === 'pending') {
        rules.push({
          rule: 'Time Overdue',
          condition: `${daysOverdue.toFixed(0)} days without action`,
          impact: 'Stalled complaint requiring escalation'
        });
        shouldEscalate = true;
        confidence += 0.15;
        factors.push('time_overdue');
        
        if (recommendedPriority !== 'urgent') {
          recommendedPriority = 'urgent';
        }
      }
    }
    
    // Rule 5: ML-based Pattern Recognition
    if (mlSettings.enabled && confidence >= mlSettings.threshold) {
      type = 'automatic';
      rules.push({
        rule: 'ML Pattern Recognition',
        condition: `Confidence: ${(confidence * 100).toFixed(0)}%`,
        impact: 'AI-powered escalation decision'
      });
    }
    
    return {
      shouldEscalate,
      recommendedPriority,
      reason: rules.map(r => `${r.rule}: ${r.condition}`).join('; '),
      confidence: Math.min(confidence, 1.0),
      factors,
      type
    };
  };

  const calculateDepartmentPerformance = (department, allComplaints) => {
    const deptComplaints = allComplaints.filter(c => c.assignedDepartment === department);
    
    if (deptComplaints.length === 0) {
      return { avgResolutionTime: 0, resolutionRate: 0, totalComplaints: 0 };
    }
    
    const resolvedComplaints = deptComplaints.filter(c => c.status === 'resolved' && c.resolvedAt);
    const avgResolutionTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((acc, c) => {
          const days = (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);
          return acc + days;
        }, 0) / resolvedComplaints.length
      : 0;
    
    const resolutionRate = (resolvedComplaints.length / deptComplaints.length) * 100;
    
    return { avgResolutionTime, resolutionRate, totalComplaints: deptComplaints.length };
  };

  const approveEscalation = (escalationId, newPriority) => {
    const updatedEscalations = escalations.map(e => 
      e.id === escalationId 
        ? { ...e, status: 'approved', escalatedPriority: newPriority, approvedBy: user.id, approvedAt: new Date().toISOString() }
        : e
    );
    
    setEscalations(updatedEscalations);
    localStorage.setItem('escalations', JSON.stringify(updatedEscalations));
    
    // Update original complaint priority
    const updatedComplaints = complaints.map(c => 
      c.id === escalations.find(e => e.id === escalationId)?.complaintId 
        ? { ...c, priority: newPriority, updatedAt: new Date().toISOString() }
        : c
    );
    
    setComplaints(updatedComplaints);
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
  };

  const rejectEscalation = (escalationId, reason) => {
    const updatedEscalations = escalations.map(e => 
      e.id === escalationId 
        ? { ...e, status: 'rejected', rejectedBy: user.id, rejectedAt: new Date().toISOString(), rejectionReason: reason }
        : e
    );
    
    setEscalations(updatedEscalations);
    localStorage.setItem('escalations', JSON.stringify(updatedEscalations));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'implemented': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingEscalations = escalations.filter(e => e.status === 'pending_review');
  const approvedEscalations = escalations.filter(e => e.status === 'approved');
  const rejectedEscalations = escalations.filter(e => e.status === 'rejected');

  // Prepare chart data
  const escalationTrends = autoEscalations.reduce((acc, esc) => {
    const date = new Date(esc.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = 0;
    acc[date]++;
    return acc;
  }, {});

  const trendData = Object.entries(escalationTrends).map(([date, count]) => ({
    date,
    escalations: count
  }));

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Escalation Decision Engine</h1>
            <p className='text-gray-600'>ML-powered complaint escalation system</p>
          </div>
        </div>

        {/* ML Settings */}
        <div className='bg-white overflow-hidden shadow rounded-lg mb-8'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>ML Configuration</h3>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <label className='text-sm font-medium text-gray-700'>Enable ML Engine</label>
                  <button
                    onClick={() => setMlSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      mlSettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${
                      mlSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div>
                  <label className='text-sm font-medium text-gray-700'>Confidence Threshold</label>
                  <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.1'
                    value={mlSettings.threshold}
                    onChange={(e) => setMlSettings(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                    className='w-full'
                  />
                  <div className='text-sm text-gray-600'>{(mlSettings.threshold * 100).toFixed(0)}%</div>
                </div>
              </div>
              
              <div>
                <label className='text-sm font-medium text-gray-700 mb-2'>Escalation Factors</label>
                <div className='space-y-2'>
                  {['department_performance', 'repeat_complainant', 'severity', 'time_overdue'].map(factor => (
                    <label key={factor} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={mlSettings.factors.includes(factor)}
                        onChange={(e) => {
                          const newFactors = e.target.checked
                            ? [...mlSettings.factors, factor]
                            : mlSettings.factors.filter(f => f !== factor);
                          setMlSettings(prev => ({ ...prev, factors: newFactors }));
                        }}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <span className='ml-2 text-sm text-gray-700'>
                        {factor.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <ExclamationTriangleIcon className='h-6 w-6 text-yellow-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Pending Review</dt>
                    <dd className='text-lg font-medium text-gray-900'>{pendingEscalations.length}</dd>
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
                    <dt className='text-sm font-medium text-gray-500 truncate'>Approved</dt>
                    <dd className='text-lg font-medium text-gray-900'>{approvedEscalations.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <ArrowTrendingUpIcon className='h-6 w-6 text-blue-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Auto-Escalated</dt>
                    <dd className='text-lg font-medium text-gray-900'>{autoEscalations.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <ClockIcon className='h-6 w-6 text-red-400' />
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>Rejected</dt>
                    <dd className='text-lg font-medium text-gray-900'>{rejectedEscalations.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Trends Chart */}
        <div className='bg-white overflow-hidden shadow rounded-lg mb-8'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>Escalation Trends</h3>
            <ResponsiveContainer width='100%' height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip />
                <Line type='monotone' dataKey='escalations' stroke='#EF4444' strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Escalations */}
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>Pending Escalations</h3>
              <div className='flex items-center space-x-2'>
                <FunnelIcon className='h-4 w-4 text-gray-400' />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className='text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='all'>All Types</option>
                  <option value='automatic'>Automatic Only</option>
                  <option value='manual'>Manual Only</option>
                </select>
              </div>
            </div>
            
            {pendingEscalations.length === 0 ? (
              <div className='text-center py-8'>
                <CheckCircleIcon className='mx-auto h-12 w-12 text-green-400 mb-3' />
                <p className='text-gray-500'>No pending escalations</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {pendingEscalations
                  .filter(e => selectedFilter === 'all' || e.type === selectedFilter)
                  .map((escalation) => (
                    <div key={escalation.id} className='border border-gray-200 rounded-lg p-4'>
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <div className='flex items-center mb-2'>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(escalation.originalPriority)}`}>
                              {escalation.originalPriority.toUpperCase()}
                            </span>
                            <ArrowTrendingUpIcon className='h-4 w-4 text-blue-500 ml-2' />
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(escalation.escalatedPriority)}`}>
                              {escalation.escalatedPriority.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className='flex items-center mb-2'>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              escalation.type === 'automatic' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {escalation.type.toUpperCase()}
                            </span>
                            <span className='ml-2 text-sm text-gray-600'>
                              Confidence: {(escalation.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          
                          <div>
                            <p className='text-sm font-medium text-gray-700 mb-1'>Reason</p>
                            <p className='text-sm text-gray-600'>{escalation.reason}</p>
                          </div>
                        </div>
                        
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => approveEscalation(escalation.id, escalation.escalatedPriority)}
                            className='text-green-600 hover:text-green-900 text-sm'
                          >
                            <CheckCircleIcon className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => rejectEscalation(escalation.id, 'Insufficient justification')}
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
      </div>
    </div>
  );
};

export default EscalationEngine;
