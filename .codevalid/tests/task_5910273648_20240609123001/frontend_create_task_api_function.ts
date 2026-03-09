import { api } from '../../../frontend/src/api';

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
        json: () => Promise.resolve({ error_message: message, status: 'error' }),
      })
    );
  }

  function mockFetchNetworkError() {
    global.fetch = jest.fn().mockImplementation(() => Promise.reject(new Error('Network error')));
  }

  // Test Case 1: Create Task with All Valid Fields
  it('Create Task with All Valid Fields', async () => {
    const input = {
      description: 'Purchase milk, eggs, and bread',
      due_date: '2024-07-15T17:00:00Z',
      priority: 'high',
      title: 'Buy groceries',
      user_name: 'alice',
    };
    const expected = {
      created_task: {
        ...input,
        id: 'generated_task_id',
      },
      status: 'success',
    };
    mockFetch(expected);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });

  // Test Case 2: Create Task with Missing Title
  it('Create Task with Missing Title', async () => {
    const input = {
      description: 'Complete assignment',
      due_date: '2024-07-10T12:00:00Z',
      priority: 'medium',
      user_name: 'bob',
    };
    mockFetchError('Title is required');
    await expect(api.createTask(input)).rejects.toThrow('Title is required');
  });

  // Test Case 3: Create Task with Missing Description
  it('Create Task with Missing Description', async () => {
    const input = {
      due_date: '2024-07-20T15:00:00Z',
      priority: 'low',
      title: 'Read book',
      user_name: 'carol',
    };
    mockFetchError('Description is required');
    await expect(api.createTask(input)).rejects.toThrow('Description is required');
  });

  // Test Case 4: Create Task with Missing Priority
  it('Create Task with Missing Priority', async () => {
    const input = {
      description: 'Evening walk in the park',
      due_date: '2024-07-10T18:00:00Z',
      title: 'Walk dog',
      user_name: 'dave',
    };
    mockFetchError('Priority is required');
    await expect(api.createTask(input)).rejects.toThrow('Priority is required');
  });

  // Test Case 5: Create Task with Missing Due Date
  it('Create Task with Missing Due Date', async () => {
    const input = {
      description: 'Book tickets and hotels',
      priority: 'high',
      title: 'Plan trip',
      user_name: 'eve',
    };
    mockFetchError('Due date is required');
    await expect(api.createTask(input)).rejects.toThrow('Due date is required');
  });

  // Test Case 6: Create Task with Missing User Name
  it('Create Task with Missing User Name', async () => {
    const input = {
      description: 'Yearly financial report',
      due_date: '2024-07-30T09:00:00Z',
      priority: 'medium',
      title: 'Submit report',
    };
    mockFetchError('User name is required');
    await expect(api.createTask(input)).rejects.toThrow('User name is required');
  });

  // Test Case 7: Create Task with Empty Title
  it('Create Task with Empty Title', async () => {
    const input = {
      description: 'Go jogging',
      due_date: '2024-07-22T06:30:00Z',
      priority: 'low',
      title: '',
      user_name: 'frank',
    };
    mockFetchError('Title cannot be empty');
    await expect(api.createTask(input)).rejects.toThrow('Title cannot be empty');
  });

  // Test Case 8: Create Task with Empty Description
  it('Create Task with Empty Description', async () => {
    const input = {
      description: '',
      due_date: '2024-07-22T06:30:00Z',
      priority: 'medium',
      title: 'Exercise',
      user_name: 'grace',
    };
    mockFetchError('Description cannot be empty');
    await expect(api.createTask(input)).rejects.toThrow('Description cannot be empty');
  });

  // Test Case 9: Create Task with Invalid Priority
  it('Create Task with Invalid Priority', async () => {
    const input = {
      description: 'Prepare for exam',
      due_date: '2024-07-25T08:00:00Z',
      priority: 'urgent',
      title: 'Study',
      user_name: 'henry',
    };
    mockFetchError('Invalid priority value');
    await expect(api.createTask(input)).rejects.toThrow('Invalid priority value');
  });

  // Test Case 10: Create Task with Due Date in the Past
  it('Create Task with Due Date in the Past', async () => {
    const input = {
      description: 'This due date is in the past',
      due_date: '2020-01-01T00:00:00Z',
      priority: 'low',
      title: 'Past task',
      user_name: 'irene',
    };
    mockFetchError('Due date cannot be in the past');
    await expect(api.createTask(input)).rejects.toThrow('Due date cannot be in the past');
  });

  // Test Case 11: Create Task with Maximum Length Title and Description
  it('Create Task with Maximum Length Title and Description', async () => {
    const maxTitle = 'T'.repeat(255);
    const maxDesc = 'D'.repeat(1024);
    const input = {
      description: maxDesc,
      due_date: '2024-08-01T12:00:00Z',
      priority: 'medium',
      title: maxTitle,
      user_name: 'julie',
    };
    const expected = {
      created_task: {
        ...input,
        id: 'generated_task_id',
      },
      status: 'success',
    };
    mockFetch(expected);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });

  // Test Case 12: Create Task with Title Exceeding Maximum Length
  it('Create Task with Title Exceeding Maximum Length', async () => {
    const longTitle = 'T'.repeat(256);
    const input = {
      description: 'Short description',
      due_date: '2024-08-02T15:00:00Z',
      priority: 'medium',
      title: longTitle,
      user_name: 'katie',
    };
    mockFetchError('Title exceeds maximum length');
    await expect(api.createTask(input)).rejects.toThrow('Title exceeds maximum length');
  });

  // Test Case 13: Create Task with Description Exceeding Maximum Length
  it('Create Task with Description Exceeding Maximum Length', async () => {
    const longDesc = 'D'.repeat(1025);
    const input = {
      description: longDesc,
      due_date: '2024-08-02T15:00:00Z',
      priority: 'medium',
      title: 'Short title',
      user_name: 'leo',
    };
    mockFetchError('Description exceeds maximum length');
    await expect(api.createTask(input)).rejects.toThrow('Description exceeds maximum length');
  });

  // Test Case 14: Create Task with User Name as Whitespace String
  it('Create Task with User Name as Whitespace String', async () => {
    const input = {
      description: 'Vacuum and dust',
      due_date: '2024-08-05T16:00:00Z',
      priority: 'low',
      title: 'Clean house',
      user_name: '    ',
    };
    mockFetchError('User name cannot be empty');
    await expect(api.createTask(input)).rejects.toThrow('User name cannot be empty');
  });

  // Test Case 15: Create Task with Valid Data but Server Error
  it('Create Task with Valid Data but Server Error', async () => {
    const input = {
      description: 'Resolve production issue',
      due_date: '2024-08-10T09:00:00Z',
      priority: 'high',
      title: 'Fix bug',
      user_name: 'mike',
    };
    mockFetchError('Internal server error', 500);
    await expect(api.createTask(input)).rejects.toThrow('Internal server error');
  });

  // Test Case 16: Create Task with Network Failure
  it('Create Task with Network Failure', async () => {
    const input = {
      description: 'Upload important documents',
      due_date: '2024-08-11T20:00:00Z',
      priority: 'medium',
      title: 'Backup files',
      user_name: 'nora',
    };
    mockFetchNetworkError();
    await expect(api.createTask(input)).rejects.toThrow('Network error');
  });

  // Test Case 17: Create Task with Duplicate Title
  it('Create Task with Duplicate Title', async () => {
    const input = {
      description: 'Summarize weekly progress',
      due_date: '2024-08-12T18:00:00Z',
      priority: 'low',
      title: 'Weekly review',
      user_name: 'oliver',
    };
    mockFetchError('A task with this title already exists', 409);
    await expect(api.createTask(input)).rejects.toThrow('A task with this title already exists');
  });

  // Test Case 18: Create Task with Additional Unexpected Fields
  it('Create Task with Additional Unexpected Fields', async () => {
    const input = {
      description: 'Sort documents into folders',
      due_date: '2024-08-13T10:00:00Z',
      extra_field: 'should be ignored',
      priority: 'medium',
      title: 'Organize files',
      user_name: 'pam',
    };
    const expected = {
      created_task: {
        description: 'Sort documents into folders',
        due_date: '2024-08-13T10:00:00Z',
        priority: 'medium',
        title: 'Organize files',
        user_name: 'pam',
        id: 'generated_task_id',
      },
      status: 'success',
    };
    mockFetch(expected);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });
});