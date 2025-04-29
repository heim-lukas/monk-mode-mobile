import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Platform, Alert, Switch } from 'react-native';
import { X, Calendar, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TimeBlock } from '@/types/types';

interface TimeblockDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (timeblock: { title: string; date: string; startTime: string; endTime: string; isFocus: boolean }) => void;
  timeBlock?: TimeBlock | null;
}

const TimeblockDialog: React.FC<TimeblockDialogProps> = ({ visible, onClose, onSave, timeBlock }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFocus, setIsFocus] = useState(true);
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Time picker states
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date());

  // Load time block data when editing
  useEffect(() => {
    if (timeBlock) {
      setTitle(timeBlock.title);
      setDate(timeBlock.date);
      setStartTime(timeBlock.startTime);
      setEndTime(timeBlock.endTime);
      setIsFocus(timeBlock.isFocus);
      
      // Set date picker
      const dateObj = new Date(timeBlock.date);
      setSelectedDate(dateObj);
      
      // Set time pickers
      const [startHours, startMinutes] = timeBlock.startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(startHours, startMinutes);
      setSelectedStartTime(startDate);
      
      const [endHours, endMinutes] = timeBlock.endTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(endHours, endMinutes);
      setSelectedEndTime(endDate);
    } else {
      // Reset form when creating new
      setTitle('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setIsFocus(true);
      setSelectedDate(new Date());
      setSelectedStartTime(new Date());
      setSelectedEndTime(new Date());
    }
  }, [timeBlock, visible]);

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Fehler', 'Bitte gebe einen Titel ein.');
      return false;
    }
    if (!date) {
      Alert.alert('Fehler', 'Bitte wähle ein Datum aus.');
      return false;
    }
    if (!startTime) {
      Alert.alert('Fehler', 'Bitte wähle eine Startzeit aus.');
      return false;
    }
    if (!endTime) {
      Alert.alert('Fehler', 'Bitte wähle eine Endzeit aus.');
      return false;
    }
    
    // Check if end time is after start time
    const startParts = startTime.split(':');
    const endParts = endTime.split(':');
    
    const startDate = new Date();
    startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]));
    
    const endDate = new Date();
    endDate.setHours(parseInt(endParts[0]), parseInt(endParts[1]));
    
    if (endDate <= startDate) {
      Alert.alert('Fehler', 'Die Endzeit muss nach der Startzeit liegen.');
      return false;
    }
    
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    onSave({ title, date, startTime, endTime, isFocus });
    // Reset form
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setIsFocus(true);
  };

  const onDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDate(formattedDate);
    }
  }, []);

  const onStartTimeChange = useCallback((event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setSelectedStartTime(selectedTime);
      // Format time as HH:MM
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setStartTime(`${hours}:${minutes}`);
    }
  }, []);

  const onEndTimeChange = useCallback((event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setSelectedEndTime(selectedTime);
      // Format time as HH:MM
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setEndTime(`${hours}:${minutes}`);
    }
  }, []);

  const renderDatePicker = () => {
    if (!showDatePicker) return null;
    
    return (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onDateChange}
      />
    );
  };

  const renderStartTimePicker = () => {
    if (!showStartTimePicker) return null;
    
    return (
      <DateTimePicker
        value={selectedStartTime}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onStartTimeChange}
      />
    );
  };

  const renderEndTimePicker = () => {
    if (!showEndTimePicker) return null;
    
    return (
      <DateTimePicker
        value={selectedEndTime}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onEndTimeChange}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-lg p-5 w-[90%] max-w-[400px]">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-primary">
              {timeBlock ? 'Aktivität bearbeiten' : 'Neue Aktivität'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#c1c1c1" size={24} />
            </TouchableOpacity>
          </View>
          
          <View className="mb-4">
            <Text className="mb-1 text-primary">Titel</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3 text-primary"
              value={title}
              onChangeText={setTitle}
              placeholder="Benenne deine Aktivität"
              placeholderTextColor="#c1c1c1"
            />
          </View>
          
          <View className="mb-4">
            <Text className="mb-1 text-primary">Datum</Text>
            <TouchableOpacity 
              className="flex-row items-center border border-gray-300 rounded-md p-3"
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar color="#c1c1c1" size={20} className="mr-2" />
              <Text className={date ? "text-primary flex-1" : "text-secondary flex-1"}>
                {date || "Datum auswählen"}
              </Text>
            </TouchableOpacity>
            {renderDatePicker()}
          </View>
          
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="mb-1 text-primary">Startzeit</Text>
              <TouchableOpacity 
                className="flex-row items-center border border-gray-300 rounded-md p-3"
                onPress={() => setShowStartTimePicker(true)}
              >
                <Clock color="#c1c1c1" size={20} className="mr-2" />
                <Text className={startTime ? "text-primary flex-1" : "text-secondary flex-1"}>
                  {startTime || "Zeit auswählen"}
                </Text>
              </TouchableOpacity>
              {renderStartTimePicker()}
            </View>
            
            <View className="flex-1 ml-2">
              <Text className="mb-1 text-primary">Endzeit</Text>
              <TouchableOpacity 
                className="flex-row items-center border border-gray-300 rounded-md p-3"
                onPress={() => setShowEndTimePicker(true)}
              >
                <Clock color="#c1c1c1" size={20} className="mr-2" />
                <Text className={endTime ? "text-primary flex-1" : "text-secondary flex-1"}>
                  {endTime || "Zeit auswählen"}
                </Text>
              </TouchableOpacity>
              {renderEndTimePicker()}
            </View>
          </View>
          
          <View className="mb-4">
            <Text className="mb-1 text-primary"></Text>
            <View className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
              <View 
                className="absolute h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ 
                  width: '50%', 
                  left: isFocus ? '50%' : '0%',
                  borderRadius: 9999
                }}
              />
              <View className="absolute inset-0 flex-row">
                <TouchableOpacity 
                  className="flex-1 items-center justify-center z-10"
                  onPress={() => setIsFocus(false)}
                >
                  <Text className={`font-medium ${!isFocus ? 'text-white' : 'text-gray-600'}`}>
                    Freizeit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 items-center justify-center z-10"
                  onPress={() => setIsFocus(true)}
                >
                  <Text className={`font-medium ${isFocus ? 'text-white' : 'text-gray-600'}`}>
                    Fokus
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            className="bg-primary rounded-md p-4 items-center mt-4"
            onPress={handleSave}
          >
            <Text className="text-white font-bold">
              {timeBlock ? 'Aktualisieren' : 'Speichern'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TimeblockDialog; 