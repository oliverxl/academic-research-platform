# ResearchHub API Documentation

This document outlines the API endpoints and smart contract functions available in the ResearchHub platform.

## Smart Contract Functions

### User Management

#### `register_user`
Register a new user on the platform.

**Parameters:**
- `name: String` - The name of the user
- `email: String` - The email of the user
- `institution: String` - The academic institution of the user

**Returns:**
- `user_id: ID` - The ID of the newly created user

#### `update_user_profile`
Update a user's profile information.

**Parameters:**
- `user_id: ID` - The ID of the user
- `name: Option<String>` - The updated name (if provided)
- `email: Option<String>` - The updated email (if provided)
- `institution: Option<String>` - The updated institution (if provided)

### Research Paper Management

#### `upload_paper`
Upload a new research paper.

**Parameters:**
- `user_id: ID` - The ID of the user uploading the paper
- `title: String` - The title of the paper
- `abstract: String` - The abstract of the paper
- `authors: Vector<String>` - The authors of the paper
- `keywords: Vector<String>` - Keywords associated with the paper
- `file_hash: String` - The hash of the file stored in Walrus
- `file_size: u64` - The size of the file in bytes
- `is_public: bool` - Whether the paper is publicly accessible

**Returns:**
- `paper_id: ID` - The ID of the newly created paper

#### `update_paper`
Update an existing research paper.

**Parameters:**
- `user_id: ID` - The ID of the user updating the paper
- `paper_id: ID` - The ID of the paper to update
- `title: Option<String>` - The updated title (if provided)
- `abstract: Option<String>` - The updated abstract (if provided)
- `authors: Option<Vector<String>>` - The updated authors (if provided)
- `keywords: Option<Vector<String>>` - The updated keywords (if provided)
- `file_hash: Option<String>` - The updated file hash (if provided)
- `file_size: Option<u64>` - The updated file size (if provided)
- `is_public: Option<bool>` - The updated public status (if provided)

#### `delete_paper`
Delete a research paper.

**Parameters:**
- `user_id: ID` - The ID of the user deleting the paper
- `paper_id: ID` - The ID of the paper to delete

### Dataset Management

#### `upload_dataset`
Upload a new dataset.

**Parameters:**
- `user_id: ID` - The ID of the user uploading the dataset
- `title: String` - The title of the dataset
- `description: String` - The description of the dataset
- `authors: Vector<String>` - The authors of the dataset
- `keywords: Vector<String>` - Keywords associated with the dataset
- `file_hash: String` - The hash of the file stored in Walrus
- `file_size: u64` - The size of the file in bytes
- `is_public: bool` - Whether the dataset is publicly accessible

**Returns:**
- `dataset_id: ID` - The ID of the newly created dataset

#### `update_dataset`
Update an existing dataset.

**Parameters:**
- `user_id: ID` - The ID of the user updating the dataset
- `dataset_id: ID` - The ID of the dataset to update
- `title: Option<String>` - The updated title (if provided)
- `description: Option<String>` - The updated description (if provided)
- `authors: Option<Vector<String>>` - The updated authors (if provided)
- `keywords: Option<Vector<String>>` - The updated keywords (if provided)
- `file_hash: Option<String>` - The updated file hash (if provided)
- `file_size: Option<u64>` - The updated file size (if provided)
- `is_public: Option<bool>` - The updated public status (if provided)

#### `delete_dataset`
Delete a dataset.

**Parameters:**
- `user_id: ID` - The ID of the user deleting the dataset
- `dataset_id: ID` - The ID of the dataset to delete

### Access Control

#### `grant_access`
Grant access to a research paper or dataset to a specific user.

**Parameters:**
- `owner_id: ID` - The ID of the owner granting access
- `resource_id: ID` - The ID of the paper or dataset
- `user_id: ID` - The ID of the user being granted access
- `permission_level: u8` - The level of permission (1: read, 2: comment, 3: edit)
- `expiration: Option<u64>` - The expiration timestamp (if any)

#### `revoke_access`
Revoke access to a research paper or dataset from a specific user.

**Parameters:**
- `owner_id: ID` - The ID of the owner revoking access
- `resource_id: ID` - The ID of the paper or dataset
- `user_id: ID` - The ID of the user whose access is being revoked

### Search & Discovery

#### `search_papers`
Search for research papers based on keywords.

**Parameters:**
- `keywords: Vector<String>` - Keywords to search for
- `author: Option<String>` - Filter by author (if provided)
- `institution: Option<String>` - Filter by institution (if provided)
- `start_date: Option<u64>` - Filter by start date (if provided)
- `end_date: Option<u64>` - Filter by end date (if provided)

**Returns:**
- `papers: Vector<Paper>` - The matching papers

#### `search_datasets`
Search for datasets based on keywords.

**Parameters:**
- `keywords: Vector<String>` - Keywords to search for
- `author: Option<String>` - Filter by author (if provided)
- `institution: Option<String>` - Filter by institution (if provided)
- `start_date: Option<u64>` - Filter by start date (if provided)
- `end_date: Option<u64>` - Filter by end date (if provided)

**Returns:**
- `datasets: Vector<Dataset>` - The matching datasets

## Frontend API Endpoints

The frontend communicates with the Sui blockchain using the following API endpoints:

### Authentication

- `POST /api/auth/login` - Log in with a Sui wallet
- `POST /api/auth/logout` - Log out

### User Management

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Research Papers

- `GET /api/papers` - Get all accessible papers
- `GET /api/papers/:id` - Get a specific paper
- `POST /api/papers` - Upload a new paper
- `PUT /api/papers/:id` - Update a paper
- `DELETE /api/papers/:id` - Delete a paper

### Datasets

- `GET /api/datasets` - Get all accessible datasets
- `GET /api/datasets/:id` - Get a specific dataset
- `POST /api/datasets` - Upload a new dataset
- `PUT /api/datasets/:id` - Update a dataset
- `DELETE /api/datasets/:id` - Delete a dataset

### Access Control

- `POST /api/access/grant` - Grant access to a resource
- `POST /api/access/revoke` - Revoke access to a resource

### Search

- `GET /api/search/papers` - Search for papers
- `GET /api/search/datasets` - Search for datasets
