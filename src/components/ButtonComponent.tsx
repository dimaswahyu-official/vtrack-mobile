// app/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    buttonStyle?: ViewStyle;
    textStyle?: TextStyle;
}

const ButtonComponent: React.FC<ButtonProps> = ({ title, onPress, buttonStyle, textStyle }) => {
    return (
        <TouchableOpacity onPress={onPress} style={buttonStyle}>
            <Text style={textStyle}>{title}</Text>
        </TouchableOpacity>
    );
};

export default ButtonComponent;
