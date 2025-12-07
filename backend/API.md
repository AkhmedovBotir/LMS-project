# Sarget Backend API Documentation

## Authentication

### POST /api/auth/login
Login to the system
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "token": "string",
      "user": {
        "id": "string",
        "username": "string",
        "role": "string"
      }
    }
  }
  ```

## Departments

### GET /api/departments
Get all departments
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### POST /api/departments
Create new department
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```

### PUT /api/departments/:id
Update department
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```

### DELETE /api/departments/:id
Delete department

## Positions

### GET /api/positions
Get all positions
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### POST /api/positions
Create new position
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```

### PUT /api/positions/:id
Update position
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```

### DELETE /api/positions/:id
Delete position

## Employees

### GET /api/employees
Get all employees
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
  - `department_id` (optional): Filter by department
  - `position_id` (optional): Filter by position
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "first_name": "string",
        "last_name": "string",
        "phone": "string",
        "email": "string",
        "department": {
          "id": "string",
          "name": "string"
        },
        "position": {
          "id": "string",
          "name": "string"
        }
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/employees/:id
Get employee by ID

### POST /api/employees
Create new employee
- **Request Body:**
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "email": "string",
    "department_id": "string",
    "position_id": "string",
    "username": "string",
    "password": "string"
  }
  ```

### PUT /api/employees/:id
Update employee
- **Request Body:**
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "email": "string",
    "department_id": "string",
    "position_id": "string"
  }
  ```

### DELETE /api/employees/:id
Delete employee

## Courses

### GET /api/courses
Get all courses
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
  - `instructor_id` (optional): Filter by instructor
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "instructor": {
          "id": "string",
          "first_name": "string",
          "last_name": "string"
        }
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/courses/:id
Get course by ID

### POST /api/courses
Create new course
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "instructor_id": "string"
  }
  ```

### PUT /api/courses/:id
Update course
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "instructor_id": "string"
  }
  ```

### DELETE /api/courses/:id
Delete course

## Groups

### GET /api/groups
Get all groups
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
  - `course_id` (optional): Filter by course
  - `teacher_id` (optional): Filter by teacher
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "course": {
          "id": "string",
          "name": "string"
        },
        "teacher": {
          "id": "string",
          "first_name": "string",
          "last_name": "string"
        }
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/groups/:id
Get group by ID

### POST /api/groups
Create new group
- **Request Body:**
  ```json
  {
    "name": "string",
    "course_id": "string",
    "teacher_id": "string"
  }
  ```

### PUT /api/groups/:id
Update group
- **Request Body:**
  ```json
  {
    "name": "string",
    "course_id": "string",
    "teacher_id": "string"
  }
  ```

### DELETE /api/groups/:id
Delete group

## Students

### GET /api/students
Get all students
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "first_name": "string",
        "last_name": "string",
        "phone": "string",
        "email": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/students/:id
Get student by ID

### POST /api/students
Create new student
- **Request Body:**
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "email": "string"
  }
  ```

### PUT /api/students/:id
Update student
- **Request Body:**
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "email": "string"
  }
  ```

### DELETE /api/students/:id
Delete student

## Group Students

### GET /api/group-students
Get all group students
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `group_id` (optional): Filter by group
  - `student_id` (optional): Filter by student
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "group": {
          "id": "string",
          "name": "string"
        },
        "student": {
          "id": "string",
          "first_name": "string",
          "last_name": "string"
        },
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### POST /api/group-students
Add student to group
- **Request Body:**
  ```json
  {
    "group_id": "string",
    "student_id": "string"
  }
  ```

### PUT /api/group-students/:id
Update group student status
- **Request Body:**
  ```json
  {
    "status": "string"
  }
  ```

### DELETE /api/group-students/:id
Remove student from group

## Topics

### GET /api/topics
Get all topics
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
  - `course_id` (optional): Filter by course
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "course": {
          "id": "string",
          "name": "string"
        }
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/topics/:id
Get topic by ID

### POST /api/topics
Create new topic
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "course_id": "string"
  }
  ```

### PUT /api/topics/:id
Update topic
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "course_id": "string"
  }
  ```

### DELETE /api/topics/:id
Delete topic

## Questions

### GET /api/questions
Get all questions
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `topic_id` (optional): Filter by topic
  - `type` (optional): Filter by type (written/test)
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "question": "string",
        "type": "string",
        "topic": {
          "id": "string",
          "name": "string"
        },
        "options": [
          {
            "id": "string",
            "text": "string",
            "is_correct": "boolean"
          }
        ]
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/questions/:id
Get question by ID

### POST /api/questions/written
Create written question
- **Request Body:**
  ```json
  {
    "question": "string",
    "topic_id": "string"
  }
  ```

### POST /api/questions/test
Create test question
- **Request Body:**
  ```json
  {
    "question": "string",
    "topic_id": "string",
    "options": [
      {
        "text": "string",
        "is_correct": "boolean"
      }
    ]
  }
  ```

### PUT /api/questions/:id
Update question
- **Request Body:**
  ```json
  {
    "question": "string",
    "topic_id": "string"
  }
  ```

### DELETE /api/questions/:id
Delete question

## Payments

### GET /api/payments
Get all payments
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `student_id` (optional): Filter by student
  - `group_id` (optional): Filter by group
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "amount": "number",
        "student": {
          "id": "string",
          "first_name": "string",
          "last_name": "string"
        },
        "group": {
          "id": "string",
          "name": "string"
        },
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/payments/:id
Get payment by ID

### POST /api/payments
Create new payment
- **Request Body:**
  ```json
  {
    "student_id": "string",
    "group_id": "string",
    "amount": "number"
  }
  ```

### PUT /api/payments/:id/status
Update payment status
- **Request Body:**
  ```json
  {
    "status": "string"
  }
  ```

### GET /api/payments/student/:student_id
Get student payment history

### GET /api/payments/group/:group_id
Get group payment statistics

## Transactions

### GET /api/transactions
Get all transactions
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `type` (optional): Filter by type
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "type": "string",
        "amount": "number",
        "description": "string",
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/transactions/:id
Get transaction by ID

### POST /api/transactions
Create new transaction
- **Request Body:**
  ```json
  {
    "type": "string",
    "amount": "number",
    "description": "string"
  }
  ```

### PUT /api/transactions/:id
Update transaction
- **Request Body:**
  ```json
  {
    "type": "string",
    "amount": "number",
    "description": "string"
  }
  ```

### PUT /api/transactions/:id/cancel
Cancel transaction

### GET /api/transactions/summary
Get transaction summary
- **Query Parameters:**
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date

### GET /api/transactions/summary/type
Get transaction summary by type
- **Query Parameters:**
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date

## Salaries

### GET /api/salaries
Get all salaries
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `employee_id` (optional): Filter by employee
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date
  - `status` (optional): Filter by status
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "amount": "number",
        "employee": {
          "id": "string",
          "first_name": "string",
          "last_name": "string"
        },
        "month": "date",
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/salaries/:id
Get salary by ID

### POST /api/salaries
Create new salary
- **Request Body:**
  ```json
  {
    "employee_id": "string",
    "month": "date",
    "amount": "number",
    "status": "string"
  }
  ```

### POST /api/salaries/calculate
Calculate salary
- **Request Body:**
  ```json
  {
    "employee_id": "string",
    "month": "date"
  }
  ```

### PUT /api/salaries/:id/status
Update salary status
- **Request Body:**
  ```json
  {
    "status": "string"
  }
  ```

### GET /api/salaries/employee/:employee_id
Get employee salary history

### DELETE /api/salaries/:id
Delete salary

## Salary Configs

### GET /api/salaries/configs
Get all salary configs
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `employee_id` (optional): Filter by employee
  - `status` (optional): Filter by status
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "employee": {
          "id": "string",
          "first_name": "string",
          "last_name": "string"
        },
        "base_salary": "number",
        "student_percentage": "number",
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/salaries/configs/:id
Get salary config by ID

### POST /api/salaries/configs
Create new salary config
- **Request Body:**
  ```json
  {
    "employee_id": "string",
    "base_salary": "number",
    "student_percentage": "number"
  }
  ```

### PUT /api/salaries/configs/:id
Update salary config
- **Request Body:**
  ```json
  {
    "base_salary": "number",
    "student_percentage": "number"
  }
  ```

### DELETE /api/salaries/configs/:id
Delete salary config

## Attendance

### GET /api/attendance
Get all attendance records
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `group_id` (optional): Filter by group
  - `date` (optional): Filter by date
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "group": {
          "id": "string",
          "name": "string"
        },
        "date": "date",
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/attendance/:id
Get attendance by ID

### POST /api/attendance
Create new attendance
- **Request Body:**
  ```json
  {
    "group_id": "string",
    "date": "date"
  }
  ```

### PUT /api/attendance/:id
Update attendance
- **Request Body:**
  ```json
  {
    "date": "date"
  }
  ```

### DELETE /api/attendance/:id
Delete attendance

## Attendance Students

### GET /api/attendance-students
Get all attendance student records
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `attendance_id` (optional): Filter by attendance
  - `student_id` (optional): Filter by student
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "attendance": {
          "id": "string",
          "date": "date"
        },
        "student": {
          "id": "string",
          "first_name": "string",
          "last_name": "string"
        },
        "status": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/attendance-students/:id
Get attendance student by ID

### POST /api/attendance-students
Create new attendance student
- **Request Body:**
  ```json
  {
    "attendance_id": "string",
    "student_id": "string",
    "status": "string"
  }
  ```

### PUT /api/attendance-students/:id
Update attendance student
- **Request Body:**
  ```json
  {
    "status": "string"
  }
  ```

### DELETE /api/attendance-students/:id
Delete attendance student

## Schedules

### GET /api/schedules
Get all schedules
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `group_id` (optional): Filter by group
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "group": {
          "id": "string",
          "name": "string"
        },
        "day_of_week": "number",
        "start_time": "string",
        "end_time": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/schedules/:id
Get schedule by ID

### POST /api/schedules
Create new schedule
- **Request Body:**
  ```json
  {
    "group_id": "string",
    "day_of_week": "number",
    "start_time": "string",
    "end_time": "string"
  }
  ```

### PUT /api/schedules/:id
Update schedule
- **Request Body:**
  ```json
  {
    "day_of_week": "number",
    "start_time": "string",
    "end_time": "string"
  }
  ```

### DELETE /api/schedules/:id
Delete schedule

## Statistics

### GET /api/statistics/overview
Get overview statistics
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "total_students": "number",
      "total_employees": "number",
      "total_courses": "number",
      "total_groups": "number",
      "total_revenue": "number",
      "total_expenses": "number"
    }
  }
  ```

### GET /api/statistics/revenue
Get revenue statistics
- **Query Parameters:**
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "total": "number",
      "by_month": [
        {
          "month": "string",
          "amount": "number"
        }
      ],
      "by_course": [
        {
          "course": {
            "id": "string",
            "name": "string"
          },
          "amount": "number"
        }
      ]
    }
  }
  ```

### GET /api/statistics/expenses
Get expenses statistics
- **Query Parameters:**
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "total": "number",
      "by_month": [
        {
          "month": "string",
          "amount": "number"
        }
      ],
      "by_type": [
        {
          "type": "string",
          "amount": "number"
        }
      ]
    }
  }
  ```

## Employee Mobile

### GET /api/employee-mobile/schedule
Get employee schedule
- **Query Parameters:**
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "group": {
          "id": "string",
          "name": "string",
          "course": {
            "id": "string",
            "name": "string"
          }
        },
        "day_of_week": "number",
        "start_time": "string",
        "end_time": "string"
      }
    ]
  }
  ```

### GET /api/employee-mobile/attendance
Get employee attendance records
- **Query Parameters:**
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "group": {
          "id": "string",
          "name": "string"
        },
        "date": "date",
        "students": [
          {
            "id": "string",
            "student": {
              "id": "string",
              "first_name": "string",
              "last_name": "string"
            },
            "status": "string"
          }
        ]
      }
    ]
  }
  ```

### POST /api/employee-mobile/attendance
Create attendance record
- **Request Body:**
  ```json
  {
    "group_id": "string",
    "date": "date",
    "students": [
      {
        "student_id": "string",
        "status": "string"
      }
    ]
  }
  ```

## Resumes

### GET /api/resumes
Get all resumes
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `employee_id` (optional): Filter by employee
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "employee": {
          "id": "string",
          "first_name": "string",
          "last_name": "string"
        },
        "education": "string",
        "experience": "string",
        "skills": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "total_pages": "number"
    }
  }
  ```

### GET /api/resumes/:id
Get resume by ID

### POST /api/resumes
Create new resume
- **Request Body:**
  ```json
  {
    "employee_id": "string",
    "education": "string",
    "experience": "string",
    "skills": "string"
  }
  ```

### PUT /api/resumes/:id
Update resume
- **Request Body:**
  ```json
  {
    "education": "string",
    "experience": "string",
    "skills": "string"
  }
  ```

### DELETE /api/resumes/:id
Delete resume

### GET /api/resumes/:id/export
Export resume to PDF 