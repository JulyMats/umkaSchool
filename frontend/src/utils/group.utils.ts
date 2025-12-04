import { GroupFormState } from '../components/features/teacher/GroupModal';


export const generateGroupCode = (): string => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  const length = 5;
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * charset.length);
    result += charset[index];
  }
  return result;
};

export const getInitialGroupForm = (): GroupFormState => ({
  name: '',
  code: generateGroupCode(),
  description: '',
  selectedStudentIds: []
});
