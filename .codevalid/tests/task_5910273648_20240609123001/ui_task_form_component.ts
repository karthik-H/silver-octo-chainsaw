import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskForm } from '../../../frontend/src/components/TaskForm';
import type { TaskCreate } from '../../../frontend/src/api';

// Helper to fill form fields
function fillFields(values: Partial<TaskCreate & { user_name?: string }> = {}) {
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

// Test Case 1: Create task with all required fields successfully
test('Create task with all required fields successfully', async () => {
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    category: 'Work',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() =>
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Task',
      description: 'Test Description',
      priority: 'High',
      category: 'Work',
      due_date: '2099-12-31',
      user_name: 'Alice'
    }))
  );
  expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
});

// Test Case 2: Validation error when title is missing
test('Validation error when title is missing', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
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

// Test Case 3: Validation error when description is missing
test('Validation error when description is missing', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
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

// Test Case 4: Validation error when priority is missing
test('Validation error when priority is missing', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
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

// Test Case 5: Validation error when due date is missing
test('Validation error when due date is missing', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
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

// Test Case 6: Validation error when user_name is missing
test('Validation error when user_name is missing', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
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

// Test Case 7: Successfully create task without category
test('Successfully create task without category', async () => {
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'High',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() =>
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Task',
      description: 'Test Description',
      priority: 'High',
      due_date: '2099-12-31',
      user_name: 'Alice',
      category: undefined
    }))
  );
  expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
});

// Test Case 8: Render all form fields
test('Render all form fields', () => {
  render(<TaskForm onSubmit={jest.fn()} onCancel={() => {}} />);
  expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Details...')).toBeInTheDocument();
  expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  expect(screen.getByLabelText('Category')).toBeInTheDocument();
  expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  expect(screen.getByLabelText('User Name')).toBeInTheDocument();
});

// Test Case 9: Validation error for invalid priority value
test('Validation error for invalid priority value', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
    title: 'Test Task',
    description: 'Test Description',
    priority: 'InvalidPriority',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/priority.*invalid/i)).toBeInTheDocument();
});

// Test Case 10: Validation error for past due date
test('Validation error for past due date', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
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

// Test Case 11: Validation error for title exceeding maximum length
test('Validation error for title exceeding maximum length', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  const longTitle = 'T'.repeat(256);
  fillFields({
    title: longTitle,
    description: 'Test Description',
    priority: 'High',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/title.*maximum/i)).toBeInTheDocument();
});

// Test Case 12: Validation errors for blank form submission
test('Validation errors for blank form submission', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled());
  expect(screen.getByText(/title.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/description.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/priority.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/due date.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/user name.*required/i)).toBeInTheDocument();
});

// Test Case 13: Validation error for required fields containing only whitespace
test('Validation error for required fields containing only whitespace', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
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

// Test Case 14: Reset form after successful submission
test('Reset form after successful submission', async () => {
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  render(<TaskForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
  fillFields({
    title: 'Reset Task',
    description: 'Reset Description',
    priority: 'Low',
    category: 'Study',
    due_date: '2099-12-31',
    user_name: 'Alice'
  });
  fireEvent.click(screen.getByText('Save Task'));
  await waitFor(() => expect(mockOnSubmit).toHaveBeenCalled());
  expect(screen.getByPlaceholderText('What needs to be done?')).toHaveValue('');
  expect(screen.getByPlaceholderText('Details...')).toHaveValue('');
  expect(screen.getByLabelText('Priority')).toHaveValue('');
  expect(screen.getByLabelText('Category')).toHaveValue('');
  expect(screen.getByLabelText('Due Date')).toHaveValue('');
  expect(screen.getByLabelText('User Name')).toHaveValue('');
});

// Test Case 15: Error messages are displayed for invalid submission
test('Error messages are displayed for invalid submission', async () => {
  render(<TaskForm onSubmit={jest.fn()} onCancel={() => {}} />);
  fireEvent.click(screen.getByText('Save Task'));
  expect(screen.getByText(/title.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/description.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/priority.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/due date.*required/i)).toBeInTheDocument();
  expect(screen.getByText(/user name.*required/i)).toBeInTheDocument();
});