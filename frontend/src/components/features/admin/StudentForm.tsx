import React from 'react';
import { Button } from '../../ui';

interface StudentFormData {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
}

interface StudentFormProps {
    formData: StudentFormData;
    onChange: (data: StudentFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isSaving: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({
    formData,
    onChange,
    onSubmit,
    onCancel,
    isSaving
}) => {
    const handleChange = (field: keyof StudentFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange({ ...formData, [field]: e.target.value });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                </label>
                <input
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                </label>
                <input
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                </label>
                <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange('dateOfBirth')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
};

