import React, { useEffect, useState } from 'react';
import { useThemeAwareStyle } from '../../utils/themeUtils';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import {
    FaWallet,
    FaMoneyBillWave,
    FaHistory,
    FaArrowUp,
    FaClock,
    FaFileInvoiceDollar
} from 'react-icons/fa';

const ChefEarnings = () => {
    const { theme, classes, isDark } = useThemeAwareStyle();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const res = await api.get('/payments/earnings');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching earnings:', error);
            toast.error('Failed to load earnings data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex justify-center items-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} p-4 md:p-8`}>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center">
                    <FaWallet className="mr-3 text-orange-500" />
                    My Earnings
                </h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                    {/* Total Earnings */}
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-green-500`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Earnings</p>
                                <h2 className="text-3xl font-extrabold mt-1">{formatCurrency(stats?.totalEarnings || 0)}</h2>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <FaMoneyBillWave className="text-green-600 w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Lifetime earnings after commission</p>
                    </div>

                    {/* Pending / Projected */}
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-yellow-500`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending Clearance</p>
                                <h2 className="text-3xl font-extrabold mt-1">{formatCurrency(stats?.pendingEarnings || 0)}</h2>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <FaClock className="text-yellow-600 w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">From pending bookings</p>
                    </div>

                    {/* Completed Jobs */}
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-blue-500`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completed Jobs</p>
                                <h2 className="text-3xl font-extrabold mt-1">{stats?.completedBookings || 0}</h2>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FaFileInvoiceDollar className="text-blue-600 w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Successfully paid bookings</p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center">
                            <FaHistory className="mr-2 opacity-70" />
                            Recent Transactions
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-green-500 uppercase tracking-wider">Your Share</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {stats?.recentTransactions?.length > 0 ? (
                                    stats.recentTransactions.map((tx) => (
                                        <tr key={tx._id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {tx.user?.name || 'Guest User'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                                                {tx.serviceType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right opacity-70">
                                                {formatCurrency(tx.totalPrice)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-400">
                                                - {formatCurrency(tx.adminCommission || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-500">
                                                + {formatCurrency(tx.chefEarnings || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {tx.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            No earnings history found yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChefEarnings;
