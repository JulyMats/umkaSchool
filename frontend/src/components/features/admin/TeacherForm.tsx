import React from 'react';
import { Button } from '../../ui';

interface TeacherFormData {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    phone: string;
}

interface TeacherFormProps {
    formData: TeacherFormData;
    onChange: (data: TeacherFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isSaving: boolean;
    submitLabel?: string;
    showPassword?: boolean;
    password?: string;
    onPasswordChange?: (password: string) => void;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
    formData,
    onChange,
    onSubmit,
    onCancel,
    isSaving,
    submitLabel = 'Save',
    showPassword = false,
    password = '',
    onPasswordChange
}) => {
    const handleChange = (field: keyof TeacherFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        onChange({ ...formData, [field]: e.target.value });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name {showPassword && '*'}
                </label>
                <input
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name {showPassword && '*'}
                </label>
                <input
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email {showPassword && '*'}
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                />
            </div>
            {showPassword && onPasswordChange && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password *
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                        minLength={6}
                    />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                </label>
                <textarea
                    value={formData.bio}
                    onChange={handleChange('bio')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : submitLabel}
                </Button>
            </div>
        </form>
    );
};

