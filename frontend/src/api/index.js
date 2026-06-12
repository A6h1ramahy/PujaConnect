import api from './axios';

export const getPandits      = (params) => api.get('/pandits', { params });
export const getPanditById   = (id)     => api.get(`/pandits/${id}`);
export const getMyProfile    = ()       => api.get('/pandits/me');
export const updateMyProfile = (data)   => api.post('/pandits/profile', data);

export const getRituals = (params) => api.get('/rituals', { params });

export const getMyBookings    = ()       => api.get('/bookings/my');
export const getPanditBookings = ()      => api.get('/bookings/pandit');
export const createBooking    = (data)   => api.post('/bookings', data);
export const acceptBooking    = (id)     => api.put(`/bookings/${id}/accept`);
export const rejectBooking    = (id, reason) => api.put(`/bookings/${id}/reject`, { reason });
export const completeBooking  = (id)     => api.put(`/bookings/${id}/complete`);
export const cancelBooking    = (id, reason) => api.put(`/bookings/${id}/cancel`, { reason });

export const getMyAvailability  = ()     => api.get('/availability/me');
export const setPanditAvail     = (data) => api.post('/availability', data);
export const deletePanditAvail  = (id)   => api.delete(`/availability/${id}`);
export const getPanditAvailability = (panditId, params) => api.get(`/availability/pandit/${panditId}`, { params });

// Admin
export const getAdminStats     = ()              => api.get('/admin/stats');
export const getPendingPandits = ()              => api.get('/admin/pandits/pending');
export const getAllPanditsAdmin = (params)        => api.get('/admin/pandits', { params });
export const verifyPandit      = (id, note)      => api.put(`/admin/pandits/${id}/verify`, { note });
export const rejectPanditAdmin = (id, reason)    => api.put(`/admin/pandits/${id}/reject`, { reason });
export const getAllUsers        = ()              => api.get('/admin/users');
export const toggleSuspend     = (id)            => api.put(`/admin/users/${id}/suspend`);
export const getAllBookingsAdmin = (params)       => api.get('/admin/bookings', { params });

// Rituals (admin)
export const createRitual = (data) => api.post('/rituals', data);
export const updateRitual = (id, data) => api.put(`/rituals/${id}`, data);
export const deleteRitual = (id)   => api.delete(`/rituals/${id}`);
export const getAllRitualsAdmin = () => api.get('/rituals/all');

// User profile
export const getUserProfile   = ()     => api.get('/users/profile');
export const updateUserProfile = (data) => api.put('/users/profile', data);
