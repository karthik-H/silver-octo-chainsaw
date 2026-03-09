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
        json: () => Promise.resolve({ error: message }),
      })
    );
  }

  function mockFetchNetworkError() {
    global.fetch = jest.fn().mockImplementation(() => Promise.reject(new Error('Network error')));
  }

  // Test Case 1: Create task with all required fields
  it('Create task with all required fields', async () => {
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'high',
      title: 'Test Task',
      user_name: 'alice',
    };
    const expected = {
      ...input,
      id: 'generated_task_id',
    };
    mockFetch(expected, true, 201);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });

  // Test Case 2: Fail to create task when title is missing
  it('Fail to create task when title is missing', async () => {
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'high',
      user_name: 'alice',
    };
    mockFetchError('Missing required field: title');
    await expect(api.createTask(input)).rejects.toThrow('Missing required field: title');
  });

  // Test Case 3: Fail to create task when description is missing
  it('Fail to create task when description is missing', async () => {
    const input = {
      due_date: '2024-07-01',
      priority: 'high',
      title: 'Test Task',
      user_name: 'alice',
    };
    mockFetchError('Missing required field: description');
    await expect(api.createTask(input)).rejects.toThrow('Missing required field: description');
  });

  // Test Case 4: Fail to create task when priority is missing
  it('Fail to create task when priority is missing', async () => {
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      title: 'Test Task',
      user_name: 'alice',
    };
    mockFetchError('Missing required field: priority');
    await expect(api.createTask(input)).rejects.toThrow('Missing required field: priority');
  });

  // Test Case 5: Fail to create task when due_date is missing
  it('Fail to create task when due_date is missing', async () => {
    const input = {
      description: 'Task description',
      priority: 'high',
      title: 'Test Task',
      user_name: 'alice',
    };
    mockFetchError('Missing required field: due_date');
    await expect(api.createTask(input)).rejects.toThrow('Missing required field: due_date');
  });

  // Test Case 6: Fail to create task when user_name is missing
  it('Fail to create task when user_name is missing', async () => {
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'high',
      title: 'Test Task',
    };
    mockFetchError('Missing required field: user_name');
    await expect(api.createTask(input)).rejects.toThrow('Missing required field: user_name');
  });

  // Test Case 7: Fail to create task when title is empty
  it('Fail to create task when title is empty', async () => {
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'high',
      title: '',
      user_name: 'alice',
    };
    mockFetchError('Title cannot be empty');
    await expect(api.createTask(input)).rejects.toThrow('Title cannot be empty');
  });

  // Test Case 8: Fail to create task when priority value is invalid
  it('Fail to create task when priority value is invalid', async () => {
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'urgent',
      title: 'Test Task',
      user_name: 'alice',
    };
    mockFetchError('Invalid value for field: priority');
    await expect(api.createTask(input)).rejects.toThrow('Invalid value for field: priority');
  });

  // Test Case 9: Fail to create task when due_date is in invalid format
  it('Fail to create task when due_date is in invalid format', async () => {
    const input = {
      description: 'Task description',
      due_date: '31-07-2024',
      priority: 'high',
      title: 'Test Task',
      user_name: 'alice',
    };
    mockFetchError('Invalid date format for field: due_date');
    await expect(api.createTask(input)).rejects.toThrow('Invalid date format for field: due_date');
  });

  // Test Case 10: Fail to create task when due_date is in the past
  it('Fail to create task when due_date is in the past', async () => {
    const input = {
      description: 'Task description',
      due_date: '2020-01-01',
      priority: 'high',
      title: 'Test Task',
      user_name: 'alice',
    };
    mockFetchError('Due date must not be in the past');
    await expect(api.createTask(input)).rejects.toThrow('Due date must not be in the past');
  });

  // Test Case 11: Create task with title at max length
  it('Create task with title at max length', async () => {
    const maxTitle = 'T'.repeat(255);
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'high',
      title: maxTitle,
      user_name: 'alice',
    };
    const expected = {
      ...input,
      id: 'generated_task_id',
    };
    mockFetch(expected, true, 201);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });

  // Test Case 12: Fail to create task when title exceeds max length
  it('Fail to create task when title exceeds max length', async () => {
    const longTitle = 'T'.repeat(256);
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'high',
      title: longTitle,
      user_name: 'alice',
    };
    mockFetchError('Title exceeds maximum length');
    await expect(api.createTask(input)).rejects.toThrow('Title exceeds maximum length');
  });

  // Test Case 13: Fail to create task on backend error
  it('Fail to create task on backend error', async () => {
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'high',
      title: 'Test Task',
      user_name: 'alice',
    };
    mockFetchError('Internal server error', 500);
    await expect(api.createTask(input)).rejects.toThrow('Internal server error');
  });

  // Test Case 14: Fail to create task on network timeout
  it('Fail to create task on network timeout', async () => {
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'high',
      title: 'Test Task',
      user_name: 'alice',
    };
    mockFetchNetworkError();
    await expect(api.createTask(input)).rejects.toThrow('Network error');
  });

  // Test Case 15: Create task with unicode characters in fields
  it('Create task with unicode characters in fields', async () => {
    const input = {
      description: 'Описание задачи с эмодзи 😄',
      due_date: '2024-07-01',
      priority: 'medium',
      title: 'Задача 📝',
      user_name: 'алиса',
    };
    const expected = {
      ...input,
      id: 'generated_task_id',
    };
    mockFetch(expected, true, 201);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });

  // Test Case 16: Create task with duplicate details
  it('Create task with duplicate details', async () => {
    const input = {
      description: 'Same task as before',
      due_date: '2024-07-02',
      priority: 'low',
      title: 'Duplicate Task',
      user_name: 'bob',
    };
    const firstResult = { ...input, id: 'generated_task_id_1' };
    const secondResult = { ...input, id: 'generated_task_id_2' };
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
  });

  // Test Case 17: Create task with minimal valid values
  it('Create task with minimal valid values', async () => {
    // T.today() is replaced with today's date in YYYY-MM-DD format
    const today = new Date().toISOString().slice(0, 10);
    const input = {
      description: 'B',
      due_date: today,
      priority: 'low',
      title: 'A',
      user_name: 'c',
    };
    const expected = {
      ...input,
      id: 'generated_task_id',
    };
    mockFetch(expected, true, 201);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });

  // Test Case 18: Ignore unknown field in request body
  it('Ignore unknown field in request body', async () => {
    const input = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'medium',
      title: 'Test Task',
      unexpected_field: 'should be ignored',
      user_name: 'alice',
    };
    const expected = {
      description: 'Task description',
      due_date: '2024-07-01',
      priority: 'medium',
      title: 'Test Task',
      user_name: 'alice',
      id: 'generated_task_id',
    };
    mockFetch(expected, true, 201);
    const result = await api.createTask(input);
    expect(result).toEqual(expected);
  });
});