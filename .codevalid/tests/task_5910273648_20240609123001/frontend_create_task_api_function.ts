import { api } from '../../../frontend/src/api';
import { Task, TaskCreate } from '../../../frontend/src/api';

describe('api.createTask', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  // Helper to mock fetch
  function mockFetch(response: any, ok = true, status = 200) {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok,
        status,
        json: () => Promise.resolve(response),
      })
    );
  }

  function mockFetchError(message: string, status = 400) {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status,
        json: () => Promise.resolve({ error: message }),
      })
    );
  }

  function mockFetchNetworkError() {
    global.fetch = jest.fn().mockImplementation(() => Promise.reject(new Error('Network error or request failed')));
  }

  // Test Case 1: Create task with all valid fields
  it('Create task with all valid fields', async () => {
    const input: TaskCreate = {
      title: 'Complete documentation',
      description: 'Finish the API documentation for the project',
      due_date: '2024-07-01T12:00:00Z',
      priority: 'High',
      completed: false,
    };
    const expected: Task = {
      ...input,
      id: 'generated_task_id',
    };
    mockFetch(expected);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });

  // Test Case 2: Create task missing title
  it('Create task missing title', async () => {
    const input: any = {
      description: 'Finish the API documentation for the project',
      due_date: '2024-07-01T12:00:00Z',
      priority: 'High',
      completed: false,
    };
    mockFetchError('Missing required field: title');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 3: Create task missing description
  it('Create task missing description', async () => {
    const input: any = {
      title: 'Complete documentation',
      due_date: '2024-07-01T12:00:00Z',
      priority: 'High',
      completed: false,
    };
    mockFetchError('Missing required field: description');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 4: Create task missing priority
  it('Create task missing priority', async () => {
    const input: any = {
      title: 'Complete documentation',
      description: 'Finish the API documentation for the project',
      due_date: '2024-07-01T12:00:00Z',
      completed: false,
    };
    mockFetchError('Missing required field: priority');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 5: Create task missing due_date
  it('Create task missing due_date', async () => {
    const input: any = {
      title: 'Complete documentation',
      description: 'Finish the API documentation for the project',
      priority: 'High',
      completed: false,
    };
    mockFetchError('Missing required field: due_date');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 6: Create task missing user_name
  it('Create task missing user_name', async () => {
    const input: any = {
      title: 'Complete documentation',
      description: 'Finish the API documentation for the project',
      due_date: '2024-07-01T12:00:00Z',
      priority: 'High',
      completed: false,
    };
    mockFetchError('Missing required field: user_name');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 7: Create task with empty title
  it('Create task with empty title', async () => {
    const input: TaskCreate = {
      title: '',
      description: 'Finish the API documentation for the project',
      due_date: '2024-07-01T12:00:00Z',
      priority: 'High',
      completed: false,
    };
    mockFetchError('Title cannot be empty');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 8: Create task with empty description
  it('Create task with empty description', async () => {
    const input: TaskCreate = {
      title: 'Complete documentation',
      description: '',
      due_date: '2024-07-01T12:00:00Z',
      priority: 'High',
      completed: false,
    };
    mockFetchError('Description cannot be empty');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 9: Create task with invalid priority
  it('Create task with invalid priority', async () => {
    const input: any = {
      title: 'Complete documentation',
      description: 'Finish the API documentation for the project',
      due_date: '2024-07-01T12:00:00Z',
      priority: 'urgent',
      completed: false,
    };
    mockFetchError('Invalid value for field: priority');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 10: Create task with invalid due_date format
  it('Create task with invalid due_date format', async () => {
    const input: TaskCreate = {
      title: 'Complete documentation',
      description: 'Finish the API documentation for the project',
      due_date: '07/01/2024 12:00',
      priority: 'High',
      completed: false,
    };
    mockFetchError('Invalid format for field: due_date');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 11: Create task with due_date in the past
  it('Create task with due_date in the past', async () => {
    const input: TaskCreate = {
      title: 'Complete documentation',
      description: 'Finish the API documentation for the project',
      due_date: '2022-01-01T00:00:00Z',
      priority: 'High',
      completed: false,
    };
    mockFetchError('Due date cannot be in the past');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 12: Create task with maximum length title
  it('Create task with maximum length title', async () => {
    const maxTitle = 'T'.repeat(255);
    const input: TaskCreate = {
      title: maxTitle,
      description: 'Finish the API documentation for the project',
      due_date: '2024-07-01T12:00:00Z',
      priority: 'High',
      completed: false,
    };
    const expected: Task = {
      ...input,
      id: 'generated_task_id',
    };
    mockFetch(expected);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });

  // Test Case 13: Create task with title exceeding maximum length
  it('Create task with title exceeding maximum length', async () => {
    const longTitle = 'T'.repeat(256);
    const input: TaskCreate = {
      title: longTitle,
      description: 'Finish the API documentation for the project',
      due_date: '2024-07-01T12:00:00Z',
      priority: 'High',
      completed: false,
    };
    mockFetchError('Title exceeds maximum length');
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 14: Create task with duplicate request
  it('Create task with duplicate request', async () => {
    const input: TaskCreate = {
      title: 'Prepare slides',
      description: 'Prepare slides for the meeting',
      due_date: '2024-07-02T12:00:00Z',
      priority: 'Medium',
      completed: false,
    };
    // Simulate backend allows duplicate, returns new id
    const firstResult: Task = { ...input, id: 'generated_task_id_1' };
    const secondResult: Task = { ...input, id: 'generated_task_id_2' };
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(callCount === 1 ? firstResult : secondResult),
      });
    });
    const resultFirstCall = await api.createTask(input);
    const resultSecondCall = await api.createTask(input);
    expect(resultFirstCall).toEqual(firstResult);
    expect(resultSecondCall).toEqual(secondResult);
    // Simulate backend returns duplicate error
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Duplicate task' }),
      })
    );
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });

  // Test Case 15: Create task with network failure
  it('Create task with network failure', async () => {
    const input: TaskCreate = {
      title: 'Submit report',
      description: 'Submit the final report',
      due_date: '2024-07-03T12:00:00Z',
      priority: 'Low',
      completed: false,
    };
    mockFetchNetworkError();
    await expect(api.createTask(input)).rejects.toThrow('Network error or request failed');
  });

  // Test Case 16: Create task with backend error
  it('Create task with backend error', async () => {
    const input: TaskCreate = {
      title: 'Submit report',
      description: 'Submit the final report',
      due_date: '2024-07-03T12:00:00Z',
      priority: 'Low',
      completed: false,
    };
    mockFetchError('Internal server error', 500);
    await expect(api.createTask(input)).rejects.toThrow('Failed to create task');
  });
});