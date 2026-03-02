# Admin Interface - Masters Management

This is the administrative interface for managing master data in the Document Management System.

## Features

### 1. Document Types Management
- Create, view, edit, and delete document types
- Define required fields for each document type
- Set validation rules
- Activate/deactivate document types

### 2. User Roles Management
- Create custom user roles
- Assign permissions to roles
- Manage role lifecycle
- View all available permissions

### 3. Departments Management
- Create organizational departments/branches
- Set contact information
- Hierarchical department structure support
- Manage department status

### 4. Retention Policies Management
- Define retention policies per document type
- Set retention periods (in months)
- Configure auto-delete options
- Set archive thresholds

## Access

The admin interface is accessible at:
```
http://localhost:3000/admin/
```

**Note:** You must be logged in with an admin role to access these features.

## Usage

### Adding a Master Record

1. Click on the relevant tab (Document Types, Roles, Departments, or Retention Policies)
2. Click the "+ Add" button
3. Fill in the required fields
4. Click "Save"

### Editing a Master Record

1. Navigate to the relevant tab
2. Find the record in the table
3. Click the "Edit" button
4. Modify the fields
5. Click "Save"

### Deleting a Master Record

1. Navigate to the relevant tab
2. Find the record in the table
3. Click the "Delete" button
4. Confirm the deletion

**Note:** Deletion is a soft delete - records are marked as inactive rather than permanently removed.

## API Integration

The admin interface communicates with the backend via the following endpoints:

- `/api/masters/document-types` - Document types CRUD
- `/api/masters/roles` - User roles CRUD
- `/api/masters/departments` - Departments CRUD
- `/api/masters/retention-policies` - Retention policies CRUD

All endpoints require JWT authentication with admin privileges.

## Security

- All API calls require a valid JWT token
- Admin role is required for all write operations
- Manager role can view document types and retention policies
- Authentication is checked on the server side

## Browser Compatibility

Tested and supported on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### "Please login first" error
- Ensure you're logged in with an admin account
- Check that your JWT token is stored in localStorage
- Token may have expired - try logging in again

### API errors
- Check browser console for detailed error messages
- Verify backend server is running
- Ensure proper permissions are set for your user role

## Future Enhancements

- Bulk operations (import/export)
- Advanced filtering and search
- Audit trail for changes
- Validation rules builder UI
- Permission matrix viewer
