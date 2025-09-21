import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, UserPlus } from 'lucide-react'

const LoginForm = ({ onLogin, onShowSignUp }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check against stored users
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const user = users.find(u => u.username === username && u.password === password)

      if (user) {
        onLogin(username)
      } else {
        // Check demo credentials
        const demoUsers = [
          { username: 'tester1', password: 'password123' },
          { username: 'tester2', password: 'password456' },
          { username: 'tester3', password: 'password789' }
        ]
        
        const demoUser = demoUsers.find(u => u.username === username && u.password === password)
        
        if (demoUser) {
          onLogin(username)
        } else {
          setError('Invalid username or password')
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Beta Testing Platform</CardTitle>
          <CardDescription>
            Sign in to submit feedback and report issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={onShowSignUp}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create New Account
            </Button>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Demo credentials:</p>
            <p>tester1 / password123</p>
            <p>tester2 / password456</p>
            <p>tester3 / password789</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm

