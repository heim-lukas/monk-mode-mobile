import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createTask, CreateTaskDTO } from '@/services/TaskService';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateTasks = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // When picker opens and no date set, default to today
  useEffect(() => {
    if (showDatePicker && dueDate === undefined) {
      setDueDate(new Date());
    }
  }, [showDatePicker]);

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }
    // Past-date validation
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sel = new Date(dueDate);
      sel.setHours(0, 0, 0, 0);
      if (sel < today) {
        Alert.alert('Validation', 'Due date cannot be in the past');
        return;
      }
    }

    setSaving(true);
    try {
      const dto: CreateTaskDTO = {
        title: title.trim(),
        description: description.trim(),
        // always defined after useEffect
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      };
      await createTask(dto);
      router.back();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-black p-4"
    >
      <Text className="text-xl text-secondary mb-4">Create Task</Text>

      <TextInput
        placeholder="Title"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
        className="bg-primary text-secondary rounded-lg p-3 mb-4"
      />

      <TextInput
        placeholder="Description (optional)"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
        className="bg-primary text-secondary rounded-lg p-3 mb-4"
      />

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className="bg-primary rounded-lg p-3 mb-4"
      >
        <Text className="text-secondary">
          {dueDate ? dueDate.toLocaleDateString() : 'Set Due Date (optional)'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setDueDate(date);
          }}
        />
      )}

      <TouchableOpacity
        onPress={onSave}
        disabled={saving}
        className="bg-secondary rounded-lg py-4 items-center"
      >
        {saving ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-primary text-lg">Save</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default CreateTasks;