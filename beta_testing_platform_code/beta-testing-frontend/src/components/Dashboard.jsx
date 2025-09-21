import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Clock, MessageSquare } from 'lucide-react'
import FeedbackForm from './FeedbackForm'

const Dashboard = ({ username, onLogout }) => {
  const [feedbackHistory, setFeedbackHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedbackHistory()
  }, [])

  const fetchFeedbackHistory = () => {
    try {
      // Get feedback from localStorage
      const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]')
      // Filter to show only current user's feedback
      const userFeedback = allFeedback.filter(item => item.tester_name === username)
      setFeedbackHistory(userFeedback)
    } catch (err) {
      console.error('Failed to fetch feedback history:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Bug': return 'bg-red-100 text-red-800'
      case 'Feedback': return 'bg-blue-100 text-blue-800'
      case 'Progress': return 'bg-green-100 text-green-800'
      case 'Feature Request': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500 text-white'
      case 'High': return 'bg-orange-500 text-white'
      case 'Medium': return 'bg-yellow-500 text-white'
      case 'Low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Beta Testing Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {username}!</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{feedbackHistory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Role</p>
                  <p className="text-2xl font-bold text-gray-900">Beta Tester</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Activity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedbackHistory.length > 0 ? 'Recent' : 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Form */}
          <div>
            <FeedbackForm username={username} onSubmissionSuccess={fetchFeedbackHistory} />
          </div>

          {/* Feedback History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Submissions</CardTitle>
                <CardDescription>
                  Track your feedback and bug reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Loading...</p>
                ) : feedbackHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No submissions yet. Submit your first feedback!
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {feedbackHistory.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <div className="flex gap-2">
                            <Badge className={getTypeColor(item.submission_type)}>
                              {item.submission_type}
                            </Badge>
                            {item.severity && (
                              <Badge className={getSeverityColor(item.severity)}>
                                {item.severity}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

