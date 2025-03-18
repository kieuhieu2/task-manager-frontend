export const permissions: { [key: string]: string[] } = {
  ADMIN: [
    '/',
    '/admin-dashboard',
    '/users',
    '/settings',
    '/reports',
  ],
  HEAD_OF_FACULTY: [
    '/',
    '/user-dashboard',
    '/profile',
  ],
  HEAD_OF_DEPARTMENT: [
    '/',
    '/editor-dashboard',
    '/content',
  ],
  LECTURE: [
    '/',
    '/about',
  ],
  STUDENT: [

  ],
  GUESS: [

  ]
};
