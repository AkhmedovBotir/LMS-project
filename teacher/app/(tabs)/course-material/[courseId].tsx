import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    Alert,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api/api';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Material {
    _id: string;
    topic: string;
    type: 'pdf' | 'video' | 'image';
    file: string;
    description: string;
    order: number;
    created_by: {
        _id: string;
        first_name: string;
        last_name: string;
    };
    created_at: string;
}

export default function CourseMaterialsScreen() {
    const { courseId } = useLocalSearchParams<{ courseId: string }>();
    const { isDarkMode } = useTheme();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [file, setFile] = useState<any>(null);
    const [description, setDescription] = useState('');
    const [order, setOrder] = useState(1);
    const [type, setType] = useState<'pdf' | 'video' | 'image'>('pdf');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editMaterial, setEditMaterial] = useState<Material | null>(null);
    const [editTopicId, setEditTopicId] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editOrder, setEditOrder] = useState(1);
    const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
    const [editFile, setEditFile] = useState<any>(null);
    const [editType, setEditType] = useState<'pdf' | 'video' | 'image'>('pdf');
    const [editUpdatedBy, setEditUpdatedBy] = useState('');

    useEffect(() => {
        loadMaterials();
    }, [courseId]);

    const loadMaterials = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Xatolik', 'Avtorizatsiya talab qilinadi');
                router.replace('/login');
                return;
            }

            const response = await api.get(`/course-material/course/${courseId}`);
            if (response.data.success) {
                setMaterials(response.data.data);
            } else {
                setError('Materiallarni yuklashda xatolik');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Materiallarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const pickFile = async () => {
        if (type === 'pdf') {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setFile({
                    uri: asset.uri,
                    type: asset.mimeType || 'application/pdf',
                    name: asset.name || 'material.pdf',
                });
            }
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setFile({
                    uri: asset.uri,
                    type: asset.type || (type === 'video' ? 'video/mp4' : 'image/jpeg'),
                    name: asset.fileName || 'material',
                });
            }
        }
    };

    const handleAddMaterial = async () => {
        try {
            if (!file) {
                Alert.alert('Xatolik', 'Fayl tanlang');
                return;
            }

            const formData = new FormData();
            formData.append('course_id', courseId);
            formData.append('type', type);
            formData.append('description', description);
            formData.append('order', order.toString());
            if (file) {
                formData.append('file', {
                    uri: file.uri,
                    type: file.type,
                    name: file.name,
                } as any);
            }

            const response = await api.post('/course-material', formData);
            if (response.data.success) {
                Alert.alert('Muvaffaqiyatli', 'Material muvaffaqiyatli qo\'shildi');
                loadMaterials();
                setShowAddModal(false);
                setFile(null);
                setDescription('');
                setOrder(1);
                setType('pdf');
            } else {
                Alert.alert('Xatolik', response.data.message || 'Material qo\'shishda xatolik');
            }
        } catch (err: any) {
            Alert.alert('Xatolik', err.response?.data?.message || 'Server xatosi');
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        try {
            const response = await api.delete(`/course-material/${materialId}`);
            if (response.data.success) {
                Alert.alert('Muvaffaqiyatli', 'Material muvaffaqiyatli o\'chirildi');
                loadMaterials();
            } else {
                Alert.alert('Xatolik', response.data.message || 'Material o\'chirishda xatolik');
            }
        } catch (err: any) {
            Alert.alert('Xatolik', err.response?.data?.message || 'Server xatosi');
        }
    };

    const handleEditMaterial = async () => {
        if (!editMaterial) return;
        try {
            const formData = new FormData();
            formData.append('topic_id', editTopicId);
            formData.append('description', editDescription);
            formData.append('order', editOrder.toString());
            formData.append('status', editStatus);
            formData.append('updated_by', editMaterial.created_by._id);
            if (editFile) {
                formData.append('file', {
                    uri: editFile.uri,
                    type: editFile.type,
                    name: editFile.name,
                } as any);
            }
            const response = await api.put(`/course-material/${editMaterial._id}`, formData);
            if (response.data.success) {
                Alert.alert('Muvaffaqiyatli', 'Material muvaffaqiyatli yangilandi');
                setShowEditModal(false);
                setEditMaterial(null);
                loadMaterials();
            } else {
                Alert.alert('Xatolik', response.data.message || 'Material yangilashda xatolik');
            }
        } catch (err: any) {
            Alert.alert('Xatolik', err.response?.data?.message || 'Server xatosi');
        }
    };

    const pickEditFile = async () => {
        if (editType === 'pdf') {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setEditFile({
                    uri: asset.uri,
                    type: asset.mimeType || 'application/pdf',
                    name: asset.name || 'material.pdf',
                });
            }
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: editType === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setEditFile({
                    uri: asset.uri,
                    type: asset.type || (editType === 'video' ? 'video/mp4' : 'image/jpeg'),
                    name: asset.fileName || 'material',
                });
            }
        }
    };

    const renderMaterialItem = ({ item }: { item: Material }) => {
        return (
            <View style={[styles.materialCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                <View style={styles.materialHeader}>
                    <Text style={[styles.materialTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                        {item.topic}
                    </Text>
                    <Text style={[styles.materialType, { color: isDarkMode ? '#6B7280' : '#6B7280' }]}>
                        {item.type.toUpperCase()}
                    </Text>
                </View>
                <Text style={[styles.materialDescription, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                    {item.description}
                </Text>
                <View style={styles.materialFooter}>
                    <Text style={[styles.materialCreatedBy, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {item.created_by.first_name} {item.created_by.last_name}
                    </Text>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteMaterial(item._id)}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={24}
                            color="#EF4444"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                            setEditMaterial(item);
                            setEditTopicId(item.topic || '');
                            setEditDescription(item.description || '');
                            setEditOrder(item.order || 1);
                            setEditStatus('active');
                            setEditType(item.type);
                            setEditFile(null);
                            setShowEditModal(true);
                        }}
                    >
                        <Ionicons name="create-outline" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
                <Text style={[styles.errorText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadMaterials}
                >
                    <Text style={styles.retryButtonText}>Qayta yuklash</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <View style={[styles.header, { borderBottomColor: isDarkMode ? '#1F2937' : '#E5E7EB' }]}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => router.push('/course-material')}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={isDarkMode ? '#FFFFFF' : '#000000'}
                    />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Kurs Materiallari
                </Text>

                <TouchableOpacity
                    style={styles.addMaterialButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons
                        name="add-circle-outline"
                        size={24}
                        color="#FFD700"
                    />
                </TouchableOpacity>
            </View>

            <FlatList
                data={materials}
                renderItem={renderMaterialItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                Yangi Material Qo'shish
                            </Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={isDarkMode ? '#FFFFFF' : '#000000'}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                    Material turi
                                </Text>
                                <View style={styles.typeSelector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeButton,
                                            type === 'pdf' && styles.typeButtonActive,
                                            { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                                        ]}
                                        onPress={() => setType('pdf')}
                                    >
                                        <Ionicons
                                            name="document-text-outline"
                                            size={20}
                                            color={type === 'pdf' ? '#FFD700' : '#6B7280'}
                                        />
                                        <Text style={[styles.typeButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                            PDF
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.typeButton,
                                            type === 'video' && styles.typeButtonActive,
                                            { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                                        ]}
                                        onPress={() => setType('video')}
                                    >
                                        <Ionicons
                                            name="videocam-outline"
                                            size={20}
                                            color={type === 'video' ? '#FFD700' : '#6B7280'}
                                        />
                                        <Text style={[styles.typeButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                            Video
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.typeButton,
                                            type === 'image' && styles.typeButtonActive,
                                            { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                                        ]}
                                        onPress={() => setType('image')}
                                    >
                                        <Ionicons
                                            name="image-outline"
                                            size={20}
                                            color={type === 'image' ? '#FFD700' : '#6B7280'}
                                        />
                                        <Text style={[styles.typeButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                            Rasm
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                    Fayl tanlash
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.fileButton,
                                        file && styles.fileButtonActive,
                                        { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                                    ]}
                                    onPress={pickFile}
                                >
                                    <Ionicons
                                        name={file ? "checkmark-done" : "folder-outline"}
                                        size={24}
                                        color={file ? '#10B981' : '#6B7280'}
                                    />
                                    <Text style={[styles.fileButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                        {file ? file.name : 'Fayl tanlash'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                    Tavsif
                                </Text>
                                <TextInput
                                    style={[
                                        styles.descriptionInput,
                                        { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                                        { color: isDarkMode ? '#FFFFFF' : '#000000' },
                                    ]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Material haqida qisqacha tavsif..."
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                    Tartib raqami
                                </Text>
                                <TextInput
                                    style={[
                                        styles.orderInput,
                                        { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                                        { color: isDarkMode ? '#FFFFFF' : '#000000' },
                                    ]}
                                    value={order.toString()}
                                    onChangeText={(text) => setOrder(parseInt(text) || 1)}
                                    placeholder="1"
                                    keyboardType="numeric"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    { backgroundColor: '#FFD700' },
                                ]}
                                onPress={handleAddMaterial}
                            >
                                <Text style={styles.submitButtonText}>Qo'shish</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showEditModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Materialni tahrirlash</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Mavzu ID (topic_id)</Text>
                                <TextInput
                                    style={[styles.descriptionInput, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
                                    value={editTopicId}
                                    onChangeText={setEditTopicId}
                                    placeholder="Mavzu ID"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Tavsif</Text>
                                <TextInput
                                    style={[styles.descriptionInput, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
                                    value={editDescription}
                                    onChangeText={setEditDescription}
                                    placeholder="Material haqida qisqacha tavsif..."
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Tartib raqami</Text>
                                <TextInput
                                    style={[styles.orderInput, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
                                    value={editOrder.toString()}
                                    onChangeText={(text) => setEditOrder(parseInt(text) || 1)}
                                    placeholder="1"
                                    keyboardType="numeric"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Holat</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <TouchableOpacity
                                        style={[styles.typeButton, editStatus === 'active' && styles.typeButtonActive, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                                        onPress={() => setEditStatus('active')}
                                    >
                                        <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>Active</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.typeButton, editStatus === 'inactive' && styles.typeButtonActive, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                                        onPress={() => setEditStatus('inactive')}
                                    >
                                        <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>Inactive</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Fayl (ixtiyoriy)</Text>
                                <TouchableOpacity
                                    style={[styles.fileButton, editFile && styles.fileButtonActive, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                                    onPress={pickEditFile}
                                >
                                    <Ionicons name={editFile ? 'checkmark-done' : 'folder-outline'} size={24} color={editFile ? '#10B981' : '#6B7280'} />
                                    <Text style={[styles.fileButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                                        {editFile ? editFile.name : 'Fayl tanlash'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: '#FFD700' }]}
                                onPress={handleEditMaterial}
                            >
                                <Text style={styles.submitButtonText}>Saqlash</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 44 : 40,
        borderBottomWidth: 1,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    menuButton: {
        padding: 8,
    },
    addMaterialButton: {
        padding: 8,
    },
    listContainer: {
        padding: 16,
    },
    materialCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    materialHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    materialTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    materialType: {
        fontSize: 14,
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    materialDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    materialFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    materialCreatedBy: {
        fontSize: 14,
    },
    deleteButton: {
        padding: 8,
    },
    editButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    formGroup: {
        marginBottom: 24,
    },
    formLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    typeButtonActive: {
        borderColor: '#FFD700',
    },
    typeButtonText: {
        marginLeft: 8,
        fontSize: 14,
    },
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    fileButtonActive: {
        borderColor: '#FFD700',
    },
    fileButtonText: {
        marginLeft: 8,
        fontSize: 14,
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    orderInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        width: 100,
    },
    submitButton: {
        marginTop: 24,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#FFD700',
    },
    submitButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '500',
    },
});