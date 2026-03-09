import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskForm } from '../../../frontend/src/components/TaskForm';
import type { Task } from '../../../frontend/src/api';

describe('TaskForm (Edit Mode)', () => {
  const initialTask: Task = {
    id: 'task-1',
    title: 'Initial Title',
    description: 'Initial Description',
    priority: 'Medium',
    due_date: '2026-03-10',
    user_name: 'Alice',
  };

  const otherTask: Task = {
    id: 'task-2',
    title: 'Other Task',
    description: 'Other Description',
    priority: 'Low',
    due_date: '2026-03-11',
    user_name: 'Bob',
  };

  let onSubmit: jest.Mock;
  let onCancel: jest.Mock;

  beforeEach(() => {
    onSubmit = jest.fn().mockResolvedValue(undefined);
    onCancel = jest.fn();
  });

  // Test Case 1: Edit task with all fields changed and submit
  it('Edit task with all fields changed and submit', async () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'High' } });
    fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: '2026-03-20' } });
    fireEvent.change(screen.getByLabelText(/User_name/i), { target: { value: 'Charlie' } });
    fireEvent.click(screen.getByText(/Save Task/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New Title',
        description: 'New Description',
        priority: 'High',
        due_date: '2026-03-20',
        user_name: 'Charlie',
      })
    );
  });

  // Test Case 2: Edit only some fields and submit
  it('Edit only some fields and submit', async () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Changed Title' } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'Low' } });
    fireEvent.click(screen.getByText(/Save Task/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Changed Title',
        description: 'Initial Description',
        priority: 'Low',
        due_date: '2026-03-10',
        user_name: 'Alice',
      })
    );
  });

  // Test Case 3: Submit form without changing any fields
  it('Submit form without changing any fields', async () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.click(screen.getByText(/Save Task/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Initial Title',
        description: 'Initial Description',
        priority: 'Medium',
        due_date: '2026-03-10',
        user_name: 'Alice',
      })
    );
    expect(screen.getByText(/no update was performed/i)).toBeInTheDocument();
  });

  // Test Case 4: Submit with some fields missing in payload
  it('Submit with some fields missing in payload', async () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Cleared Title' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/Save Task/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Cleared Title',
        description: '',
        priority: 'Medium',
        due_date: '2026-03-10',
        user_name: 'Alice',
      })
    );
  });

  // Test Case 5: Attempt to edit a non-existent task
  it('Attempt to edit a non-existent task', () => {
    render(<TaskForm initialTask={undefined} onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByText(/task does not exist/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Title/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Description/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Priority/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Due Date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/User_name/i)).not.toBeInTheDocument();
  });

  // Test Case 6: Form pre-fills with initialTask data in edit mode
  it('Form pre-fills with initialTask data in edit mode', () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByLabelText(/Title/i)).toHaveValue('Initial Title');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Initial Description');
    expect(screen.getByLabelText(/Priority/i)).toHaveValue('Medium');
    expect(screen.getByLabelText(/Due Date/i)).toHaveValue('2026-03-10');
    expect(screen.getByLabelText(/User_name/i)).toHaveValue('Alice');
  });

  // Test Case 7: State updates on input change
  it('State updates on input change', () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'Updated Description' } });
    expect(descInput).toHaveValue('Updated Description');
  });

  // Test Case 8: Cancel editing does not submit changes
  it('Cancel editing does not submit changes', () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(onCancel).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // Test Case 9: Form validation for required fields
  it('Form validation for required fields', async () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/Save Task/i));
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  // Test Case 10: Editing a task does not affect other tasks
  it('Editing a task does not affect other tasks', async () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Task A Updated' } });
    fireEvent.click(screen.getByText(/Save Task/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Task A Updated',
        description: 'Initial Description',
        priority: 'Medium',
        due_date: '2026-03-10',
        user_name: 'Alice',
      })
    );
    expect(otherTask.title).toBe('Other Task');
  });

  // Test Case 11: Priority field displays correct options
  it('Priority field displays correct options', () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    const prioritySelect = screen.getByLabelText(/Priority/i);
    expect(prioritySelect).toHaveValue('Medium');
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  // Test Case 12: Due date field displays correctly formatted date
  it('Due date field displays correctly formatted date', () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    expect(dueDateInput).toHaveValue('2026-03-10');
  });

  // Test Case 13: User_name field is pre-filled with initialTask value
  it('User_name field is pre-filled with initialTask value', () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByLabelText(/User_name/i)).toHaveValue('Alice');
  });

  // Test Case 14: Submitting with invalid due date shows error
  it('Submitting with invalid due date shows error', async () => {
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: 'invalid-date' } });
    fireEvent.click(screen.getByText(/Save Task/i));
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/due date validation error/i)).toBeInTheDocument();
    });
  });

  // Test Case 15: Prevent multiple submits while loading
  it('Prevent multiple submits while loading', async () => {
    let submitting = false;
    onSubmit = jest.fn(async () => {
      submitting = true;
      await new Promise(resolve => setTimeout(resolve, 100));
      submitting = false;
    });
    render(<TaskForm initialTask={initialTask} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.click(screen.getByText(/Save Task/i));
    fireEvent.click(screen.getByText(/Save Task/i));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});