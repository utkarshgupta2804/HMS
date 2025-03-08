import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';

const Overview = ({ dashboardData }) => {
  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {dashboardData?.fullname || 'User'}!
        </h2>
        <p className="text-gray-600">Here's your health overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Upcoming Appointments', value: dashboardData?.upcomingAppointments || 0, color: 'from-blue-600 to-blue-800' },
          { label: 'Past Appointments', value: dashboardData?.pastAppointments || 0, color: 'from-green-600 to-green-800' },
          { label: 'Medical Records', value: dashboardData?.medicalRecords || 0, color: 'from-purple-600 to-purple-800' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-xl p-6 hover:bg-gray-50/70 transition-all"
          >
            <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {(dashboardData?.recentActivity || []).map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <FiCalendar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{activity.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(activity.datetime).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                activity.status === 'upcoming' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {activity.status}
              </span>
            </motion.div>
          ))}
          {(!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Overview;
