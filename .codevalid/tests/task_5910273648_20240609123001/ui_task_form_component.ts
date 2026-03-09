import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskForm } from '../../../frontend/src/components/TaskForm';
import type { TaskCreate } from '../../../frontend/src/api';

// Helper to fill required fields
function fillRequiredFields(values: Partial<TaskCreate & { user_name?: string }> = {}) {
  if (values.title !== undefined) {
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), { target: { value: values.title } });
  }
  if (values.description !== undefined) {
    fireEvent.change(screen.getByPlaceholderText('Details...'), { target: { value: values.description } });
  }
  if (values.priority !== undefined) {
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: values.priority } });
  }
  if (values.category !== undefined) {
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: values.category } });
  }
  if (values.due_date !== undefined) {
    fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: values.due_date } });
  }
  if (values.user_name !== undefined) {
    fireEvent.change(screen.getByLabelText('User Name'), { target: { value: values.user_name } });
  }
}

// Test Case 1: Create Task with All Required Fields
test('Create Task with All Required Fields', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    category: 'Work',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));
  expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    category: 'Work',
    due_date: '2099-12-31',
    user_name: 'Alice'
  }));
  expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
});

// Test Case 2: Missing Title Validation
test('Missing Title Validation', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    description: 'Test Description',
    priority: 'High',
    category: 'Work',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/title.*required/i)).toBeInTheDocument();
});

// Test Case 3: Missing Description Validation
test('Missing Description Validation', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    priority: 'High',
    category: 'Work',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/description.*required/i)).toBeInTheDocument();
});

// Test Case 4: Missing Priority Validation
test('Missing Priority Validation', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    category: 'Work',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/priority.*required/i)).toBeInTheDocument();
});

// Test Case 5: Missing Due Date Validation
test('Missing Due Date Validation', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    category: 'Work',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/due date.*required/i)).toBeInTheDocument();
});

// Test Case 6: Missing User Name Validation
test('Missing User Name Validation', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    category: 'Work',
    due_date: '2099-12-31'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/user name.*required/i)).toBeInTheDocument();
});

// Test Case 7: Multiple Missing Fields Validation
test('Multiple Missing Fields Validation', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/description.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/priority.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/due date.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/user name.*required/i)).toBeInTheDocument();
});

// Test Case 8: Category Field Optional
test('Category Field Optional', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));
  expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
    category: undefined
  }));
  expect(screen.queryByText(/category.*required/i)).not.toBeInTheDocument();
});

// Test Case 9: Priority Minimum Edge Value
test('Priority Minimum Edge Value', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'Low',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
    priority: 'Low'
  }));
  expect(screen.queryByText(/priority.*required/i)).not.toBeInTheDocument();
});

// Test Case 10: Priority Maximum Edge Value
test('Priority Maximum Edge Value', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
    priority: 'High'
  }));
  expect(screen.queryByText(/priority.*required/i)).not.toBeInTheDocument();
});

// Test Case 11: Due Date in Past Validation
test('Due Date in Past Validation', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    due_date: '2000-01-01',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/due date.*past/i)).toBeInTheDocument();
});

// Test Case 12: Due Date Today Edge Case
test('Due Date Today Edge Case', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  const today = new Date().toISOString().split('T')[0];
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    due_date: today,
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
    due_date: today
  }));
  expect(screen.queryByText(/due date.*past/i)).not.toBeInTheDocument();
});

// Test Case 13: Title Maximum Length Edge Case
test('Title Maximum Length Edge Case', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  const maxTitle = 'T'.repeat(255);
  fillRequiredFields({
    title: maxTitle,
    description: 'Test Description',
    priority: 'High',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
    title: maxTitle
  }));
  expect(screen.queryByText(/title.*max/i)).not.toBeInTheDocument();
});

// Test Case 14: Title Exceeds Maximum Length
test('Title Exceeds Maximum Length', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  const tooLongTitle = 'T'.repeat(256);
  fillRequiredFields({
    title: tooLongTitle,
    description: 'Test Description',
    priority: 'High',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/title.*max/i)).toBeInTheDocument();
});

// Test Case 15: Form Initial State is Blank
test('Form Initial State is Blank', () => {
  render(<TaskForm onSubmit={jest.fn()} onCancel={() => {}} />);
  expect(screen.getByPlaceholderText('What needs to be done?')).toHaveValue('');
  expect(screen.getByPlaceholderText('Details...')).toHaveValue('');
  expect(screen.getByLabelText('Priority')).toHaveValue('');
  expect(screen.getByLabelText('Category')).toHaveValue('');
  expect(screen.getByLabelText('Due Date')).toHaveValue('');
  expect(screen.getByLabelText('User Name')).toHaveValue('');
  expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
});

// Test Case 16: Form Reset or Cancel Button
test('Form Reset or Cancel Button', async () => {
  render(<TaskForm onSubmit={jest.fn()} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Task',
    description: 'Desc',
    priority: 'High',
    category: 'Work',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  fireEvent.click(screen.getByText(/reset|cancel/i));
  expect(screen.getByPlaceholderText('What needs to be done?')).toHaveValue('');
  expect(screen.getByPlaceholderText('Details...')).toHaveValue('');
  expect(screen.getByLabelText('Priority')).toHaveValue('');
  expect(screen.getByLabelText('Category')).toHaveValue('');
  expect(screen.getByLabelText('Due Date')).toHaveValue('');
  expect(screen.getByLabelText('User Name')).toHaveValue('');
  expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
});

// Test Case 17: Category Field Selection
test('Category Field Selection', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    category: 'Personal',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
    category: 'Personal'
  }));
});

// Test Case 18: Form Renders All Fields and Labels
test('Form Renders All Fields and Labels', () => {
  render(<TaskForm onSubmit={jest.fn()} onCancel={() => {}} />);
  expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Details...')).toBeInTheDocument();
  expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  expect(screen.getByLabelText('Category')).toBeInTheDocument();
  expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  expect(screen.getByLabelText('User Name')).toBeInTheDocument();
});

// Test Case 19: Submit Button Disabled When Invalid
test('Submit Button Disabled When Invalid', () => {
  render(<TaskForm onSubmit={jest.fn()} onCancel={() => {}} />);
  const submitBtn = screen.getByText('Save Task');
  expect(submitBtn).toBeDisabled();
  fillRequiredFields({
    title: 'Task',
    description: 'Desc',
    priority: 'High',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  expect(submitBtn).not.toBeDisabled();
});

// Test Case 20: Whitespace Only Fields Validation
test('Whitespace Only Fields Validation', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillRequiredFields({
    title: '   ',
    description: '   ',
    priority: 'High',
    due_date: '2099-12-31',
    user_name: '   '
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/title.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/description.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/user name.*required/i)).toBeInTheDocument();
});