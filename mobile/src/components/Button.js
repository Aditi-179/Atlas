import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

const Button = ({ title, onPress, style, variant = 'primary', loading = false, disabled = false }) => {
    
    const getBackgroundColor = () => {
        if (disabled) return colors.border;
        if (variant === 'primary') return colors.primaryTeal;
        if (variant === 'secondary') return colors.slateDark;
        if (variant === 'danger') return colors.critical;
        return colors.primaryTeal;
    };

    return (
        <TouchableOpacity
            style={[
                styles.button, 
                { backgroundColor: getBackgroundColor() }, 
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={colors.surface} />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    text: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    }
});

export default Button;
