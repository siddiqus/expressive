const mockErrors = jest.fn().mockReturnValue(() => { });
const mockCelebrate = jest.fn().mockReturnValue(() => { });
const mockIsCelebrate = jest.fn().mockReturnValue(() => { });

module.exports = {
    errors: mockErrors,
    celebrate: mockCelebrate,
    isCelebrate: mockIsCelebrate,
    __clearMocks() {
        mockErrors.mockClear();
        mockCelebrate.mockClear();
        mockIsCelebrate.mockClear();
    },
    __getMocks() {
        return {
            mockErrors,
            mockCelebrate,
            mockIsCelebrate
        };
    }
};

