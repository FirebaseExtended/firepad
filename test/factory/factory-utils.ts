/**
 * Resets all information stored in the mockFn.mock.calls and mockFn.mock.instances arrays.
 *
 * Often this is useful when you want to clean up a mock's usage data between two assertions.
 * @param factoryImpl - Factory Implementation with Mock Functions as methods.
 */
export function clearMock(factoryImpl: Object) {
  Object.values(factoryImpl).forEach((mockFn: jest.Mock) => mockFn.mockClear());
}

/**
 * Resets all information stored in the mock, including any initial implementation and mock name given.
 *
 * This is useful when you want to completely restore a mock back to its initial state.
 * @param factoryImpl - Factory Implementation with Mock Functions as methods.
 */
export function resetMock(factoryImpl: Object) {
  Object.values(factoryImpl).forEach((mockFn: jest.Mock) => mockFn.mockReset());
}
