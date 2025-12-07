import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 1. Yangi mehmon qo'shish
export const addReception = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/reception`, {
      fullName: data.fullName,
      phone: data.phone,
      notes: data.notes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Server bilan bog\'lanishda xatolik yuz berdi' };
  }
};

// 2. Barcha mehmonlarni olish
export const getAllReceptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/reception`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Server bilan bog\'lanishda xatolik yuz berdi' };
  }
};

// 3. Bitta mehmonni olish
export const getReceptionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reception/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Server bilan bog\'lanishda xatolik yuz berdi' };
  }
};

// 4. Aloqa qilish
export const contactReception = async (id, data) => {
  try {
    const response = await axios.patch(`${API_URL}/reception/${id}/contact`, {
      contactNotes: data.contactNotes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Server bilan bog\'lanishda xatolik yuz berdi' };
  }
};

// 5. Sinovga qo'shish
export const addToTrial = async (id, data) => {
  try {
    const response = await axios.patch(`${API_URL}/reception/${id}/trial`, {
      trialNotes: data.trialNotes,
      trialDate: data.trialDate
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Server bilan bog\'lanishda xatolik yuz berdi' };
  }
};

// 6. O'quvchiga aylantirish
export const convertToStudent = async (id, data) => {
  try {
    const response = await axios.patch(`${API_URL}/reception/${id}/convert-to-student`, {
      groupId: data.groupId,
      studentData: {
        fullName: data.studentData.fullName,
        phone: data.studentData.phone,
        birthDate: data.studentData.birthDate,
        address: data.studentData.address,
        parentPhone: data.studentData.parentPhone,
        parentName: data.studentData.parentName,
        gender: data.studentData.gender,
        last_name: data.studentData.last_name,
        first_name: data.studentData.first_name
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Server bilan bog\'lanishda xatolik yuz berdi' };
  }
};

// 7. Mehmonni o'chirish
export const deleteReception = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/reception/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Server bilan bog\'lanishda xatolik yuz berdi' };
  }
}; 