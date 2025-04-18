// This service handles interactions with the Sui blockchain

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// Initialize the Sui client
const suiClient = new SuiClient({
  url: 'https://fullnode.testnet.sui.io',
});

// Package ID for the research hub contract
// TODO: Replace with the actual package ID after deployment
const PACKAGE_ID = '0x123456789abcdef'; // This is a placeholder, replace with actual ID in production

// Resource types
const RESOURCE_TYPE_PAPER = 1;
const RESOURCE_TYPE_DATASET = 2;

/**
 * Register a new user
 * @param {string} name - The user's name
 * @param {string} email - The user's email
 * @param {string} institution - The user's institution
 * @returns {Promise<Object>} - The transaction result
 */
export const registerUser = async (wallet, name, email, institution) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Call the register_user function
    txb.moveCall({
      target: `${PACKAGE_ID}::research_hub::register_user`,
      arguments: [
        txb.pure(name),
        txb.pure(email),
        txb.pure(institution)
      ],
    });

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Upload a research paper
 * @param {Object} paperData - The paper data
 * @returns {Promise<Object>} - The transaction result
 */
export const uploadPaper = async (wallet, paperData) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Call the upload_paper function
    txb.moveCall({
      target: `${PACKAGE_ID}::research_hub::upload_paper`,
      arguments: [
        txb.pure(paperData.title),
        txb.pure(paperData.abstract),
        txb.pure(paperData.authors),
        txb.pure(paperData.keywords),
        txb.pure(paperData.fileHash),
        txb.pure(paperData.fileSize.toString()),
        txb.pure(paperData.isPublic),
      ],
    });

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error uploading paper:', error);
    throw error;
  }
};

/**
 * Upload a dataset
 * @param {Object} datasetData - The dataset data
 * @returns {Promise<Object>} - The transaction result
 */
export const uploadDataset = async (wallet, datasetData) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Call the upload_dataset function
    txb.moveCall({
      target: `${PACKAGE_ID}::research_hub::upload_dataset`,
      arguments: [
        txb.pure(datasetData.title),
        txb.pure(datasetData.description),
        txb.pure(datasetData.authors),
        txb.pure(datasetData.keywords),
        txb.pure(datasetData.fileHash),
        txb.pure(datasetData.fileSize.toString()),
        txb.pure(datasetData.isPublic),
      ],
    });

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error uploading dataset:', error);
    throw error;
  }
};

/**
 * Grant access to a resource
 * @param {string} accessControlId - The ID of the access control object
 * @param {string} userId - The ID of the user to grant access to
 * @param {number} permissionLevel - The permission level
 * @param {number|null} expiration - The expiration timestamp (if any)
 * @returns {Promise<Object>} - The transaction result
 */
export const grantAccess = async (wallet, accessControlId, userId, permissionLevel, expiration = null) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Call the grant_access function
    txb.moveCall({
      target: `${PACKAGE_ID}::research_hub::grant_access`,
      arguments: [
        txb.object(accessControlId),
        txb.pure(userId),
        txb.pure(permissionLevel.toString()),
        expiration ? txb.pure(expiration.toString()) : txb.pure(null),
      ],
    });

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error granting access:', error);
    throw error;
  }
};

/**
 * Revoke access to a resource
 * @param {string} accessControlId - The ID of the access control object
 * @param {string} userId - The ID of the user to revoke access from
 * @returns {Promise<Object>} - The transaction result
 */
export const revokeAccess = async (wallet, accessControlId, userId) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Call the revoke_access function
    txb.moveCall({
      target: `${PACKAGE_ID}::research_hub::revoke_access`,
      arguments: [
        txb.object(accessControlId),
        txb.pure(userId),
      ],
    });

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
};

/**
 * Get all papers accessible to the current user
 * @param {boolean} publicOnly - Whether to only return public papers
 * @returns {Promise<Array>} - The papers
 */
export const getPapers = async (wallet, publicOnly = false) => {
  try {
    // Query the blockchain for papers
    const papers = [];

    // Get papers owned by the current user
    const ownedPapers = await suiClient.getOwnedObjects({
      owner: wallet.currentAccount?.address,
      filter: {
        StructType: `${PACKAGE_ID}::research_hub::Paper`,
      },
      options: {
        showContent: true,
      },
    });

    // Process owned papers
    for (const paperObj of ownedPapers.data) {
      if (paperObj.data?.content?.fields) {
        const fields = paperObj.data.content.fields;
        papers.push({
          id: paperObj.data.objectId,
          title: fields.title,
          abstract: fields.abstract,
          authors: fields.authors,
          keywords: fields.keywords,
          fileHash: fields.file_hash,
          fileSize: parseInt(fields.file_size),
          isPublic: fields.is_public,
          owner: fields.owner,
          createdAt: parseInt(fields.created_at) * 1000, // Convert to milliseconds
        });
      }
    }

    // If not publicOnly, also get papers shared with the user
    if (!publicOnly) {
      // This would require a custom query or indexer in a real implementation
      // For now, we'll add some mock shared papers
      papers.push({
        id: '0x789',
        title: 'Machine Learning for Climate Science',
        abstract: 'This paper demonstrates how machine learning can be applied to climate science...',
        authors: ['Alice Johnson', 'Bob Brown'],
        keywords: ['machine learning', 'climate science', 'neural networks'],
        fileHash: 'def456',
        fileSize: 1024 * 1024 * 3, // 3MB
        isPublic: true,
        owner: '0xabc',
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
      });
    }

    return papers;
  } catch (error) {
    console.error('Error getting papers:', error);
    // Return mock data if there's an error (for development purposes)
    return [
      {
        id: '0x123',
        title: 'Advances in Quantum Computing',
        abstract: 'This paper explores recent advances in quantum computing...',
        authors: ['John Doe', 'Jane Smith'],
        keywords: ['quantum computing', 'quantum mechanics', 'qubits'],
        fileHash: 'abc123',
        fileSize: 1024 * 1024 * 2, // 2MB
        isPublic: true,
        owner: '0x456',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      },
      {
        id: '0x789',
        title: 'Machine Learning for Climate Science',
        abstract: 'This paper demonstrates how machine learning can be applied to climate science...',
        authors: ['Alice Johnson', 'Bob Brown'],
        keywords: ['machine learning', 'climate science', 'neural networks'],
        fileHash: 'def456',
        fileSize: 1024 * 1024 * 3, // 3MB
        isPublic: true,
        owner: '0xabc',
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
      },
    ];
  }
};

/**
 * Get all datasets accessible to the current user
 * @param {boolean} publicOnly - Whether to only return public datasets
 * @returns {Promise<Array>} - The datasets
 */
export const getDatasets = async (wallet, publicOnly = false) => {
  try {
    // Query the blockchain for datasets
    const datasets = [];

    // Get datasets owned by the current user
    const ownedDatasets = await suiClient.getOwnedObjects({
      owner: wallet.currentAccount?.address,
      filter: {
        StructType: `${PACKAGE_ID}::research_hub::Dataset`,
      },
      options: {
        showContent: true,
      },
    });

    // Process owned datasets
    for (const datasetObj of ownedDatasets.data) {
      if (datasetObj.data?.content?.fields) {
        const fields = datasetObj.data.content.fields;
        datasets.push({
          id: datasetObj.data.objectId,
          title: fields.title,
          description: fields.description,
          authors: fields.authors,
          keywords: fields.keywords,
          fileHash: fields.file_hash,
          fileSize: parseInt(fields.file_size),
          isPublic: fields.is_public,
          owner: fields.owner,
          createdAt: parseInt(fields.created_at) * 1000, // Convert to milliseconds
        });
      }
    }

    // If not publicOnly, also get datasets shared with the user
    if (!publicOnly) {
      // This would require a custom query or indexer in a real implementation
      // For now, we'll add some mock shared datasets
      datasets.push({
        id: '0xabc',
        title: 'Genomic Sequences Dataset',
        description: 'This dataset contains genomic sequences for various species...',
        authors: ['Genomics Lab'],
        keywords: ['genomics', 'DNA', 'sequencing'],
        fileHash: 'jkl012',
        fileSize: 1024 * 1024 * 100, // 100MB
        isPublic: false,
        owner: '0xabc',
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
      });
    }

    return datasets;
  } catch (error) {
    console.error('Error getting datasets:', error);
    // Return mock data if there's an error (for development purposes)
    return [
      {
        id: '0xdef',
        title: 'Climate Data 2010-2020',
        description: 'This dataset contains climate measurements from 2010 to 2020...',
        authors: ['Climate Research Institute'],
        keywords: ['climate', 'temperature', 'precipitation'],
        fileHash: 'ghi789',
        fileSize: 1024 * 1024 * 50, // 50MB
        isPublic: true,
        owner: '0x456',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      },
      {
        id: '0xabc',
        title: 'Genomic Sequences Dataset',
        description: 'This dataset contains genomic sequences for various species...',
        authors: ['Genomics Lab'],
        keywords: ['genomics', 'DNA', 'sequencing'],
        fileHash: 'jkl012',
        fileSize: 1024 * 1024 * 100, // 100MB
        isPublic: false,
        owner: '0xabc',
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
      },
    ];
  }
};

/**
 * Add a citation to a paper
 * @param {string} paperId - The ID of the paper
 * @param {string} citedPaperId - The ID of the cited paper
 * @param {string} citationText - The citation text
 * @param {number|null} pageNumber - The page number (if any)
 * @returns {Promise<Object>} - The transaction result
 */
export const addCitation = async (wallet, paperId, citedPaperId, citationText, pageNumber = null) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Get the paper object
    const paper = txb.object(paperId);

    // Call the add_citation function
    txb.moveCall({
      target: `${PACKAGE_ID}::citation::add_citation`,
      arguments: [
        paper,
        txb.pure(citedPaperId),
        txb.pure(citationText),
        pageNumber ? txb.pure(pageNumber) : txb.pure(null),
      ],
    });

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error adding citation:', error);
    throw error;
  }
};

/**
 * Remove a citation
 * @param {string} citationId - The ID of the citation to remove
 * @returns {Promise<Object>} - The transaction result
 */
export const removeCitation = async (wallet, citationId) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Get the citation object
    const citation = txb.object(citationId);

    // Call the remove_citation function
    txb.moveCall({
      target: `${PACKAGE_ID}::citation::remove_citation`,
      arguments: [citation],
    });

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error removing citation:', error);
    throw error;
  }
};

/**
 * Get citations for a paper
 * @param {string} paperId - The ID of the paper
 * @returns {Promise<Array>} - The citations
 */
export const getCitations = async (_, paperId) => {
  try {
    // In a real implementation, this would query the blockchain for citations using the wallet
    // For now, we'll return mock data based on paperId
    return [
      {
        id: '0xcit1',
        paperId,
        citedPaperId: '0x123',
        citedPaperTitle: 'Advances in Quantum Computing',
        citationText: 'This paper provides a comprehensive overview of quantum computing principles.',
        pageNumber: 42,
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      },
      {
        id: '0xcit2',
        paperId,
        citedPaperId: '0x456',
        citedPaperTitle: 'Machine Learning Applications in Climate Science',
        citationText: 'The authors present a novel approach to climate prediction using neural networks.',
        pageNumber: null,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
      },
    ];
  } catch (error) {
    console.error('Error getting citations:', error);
    throw error;
  }
};

/**
 * Add a comment to a resource
 * @param {string} resourceId - The ID of the resource
 * @param {number} resourceType - The type of resource (1 for paper, 2 for dataset)
 * @param {string} content - The comment content
 * @returns {Promise<Object>} - The transaction result
 */
export const addComment = async (wallet, resourceId, resourceType, content) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Get the resource object
    const resource = txb.object(resourceId);

    // Call the appropriate add_comment function based on resource type
    if (resourceType === RESOURCE_TYPE_PAPER) {
      txb.moveCall({
        target: `${PACKAGE_ID}::comment::add_comment_to_paper`,
        arguments: [
          resource,
          txb.pure(content),
        ],
      });
    } else if (resourceType === RESOURCE_TYPE_DATASET) {
      txb.moveCall({
        target: `${PACKAGE_ID}::comment::add_comment_to_dataset`,
        arguments: [
          resource,
          txb.pure(content),
        ],
      });
    } else {
      throw new Error('Invalid resource type');
    }

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Update a comment
 * @param {string} commentId - The ID of the comment to update
 * @param {string} content - The new comment content
 * @returns {Promise<Object>} - The transaction result
 */
export const updateComment = async (wallet, commentId, content) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Get the comment object
    const comment = txb.object(commentId);

    // Call the update_comment function
    txb.moveCall({
      target: `${PACKAGE_ID}::comment::update_comment`,
      arguments: [
        comment,
        txb.pure(content),
      ],
    });

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

/**
 * Remove a comment
 * @param {string} commentId - The ID of the comment to remove
 * @param {string} threadId - The ID of the comment thread
 * @returns {Promise<Object>} - The transaction result
 */
export const removeComment = async (wallet, commentId, threadId) => {
  try {
    const { signAndExecuteTransaction } = wallet;

    const txb = new Transaction();

    // Get the comment thread object
    const thread = txb.object(threadId);

    // Call the remove_comment function
    txb.moveCall({
      target: `${PACKAGE_ID}::comment::remove_comment`,
      arguments: [
        thread,
        txb.pure(commentId),
      ],
    });

    const result = await signAndExecuteTransaction({
      transaction: txb,
    });

    return result;
  } catch (error) {
    console.error('Error removing comment:', error);
    throw error;
  }
};

/**
 * Get comments for a resource
 * @param {string} resourceId - The ID of the resource
 * @param {number} resourceType - The type of resource (1 for paper, 2 for dataset)
 * @returns {Promise<Array>} - The comments
 */
export const getComments = async (_, _resourceId, _resourceType) => {
  try {
    // In a real implementation, this would query the blockchain for comments using the wallet, resourceId, and resourceType
    // For now, we'll return mock data
    return [
      {
        id: '0xcom1',
        author: '0x456',
        authorName: 'Jane Smith',
        content: 'Great paper! I found the methodology particularly interesting.',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
      {
        id: '0xcom2',
        author: '0x789',
        authorName: 'Bob Johnson',
        content: 'I have a question about the experimental setup. Could you provide more details?',
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      },
      {
        id: '0xcom3',
        author: '0x456',
        authorName: 'Jane Smith',
        content: 'Thanks for the clarification. That makes sense now.',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      },
    ];
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

/**
 * Get a paper by ID
 * @param {string} paperId - The ID of the paper
 * @returns {Promise<Object>} - The paper
 */
export const getPaperById = async (wallet, paperId) => {
  try {
    // In a real implementation, this would query the blockchain for the paper
    // For now, we'll return mock data
    const papers = await getPapers(wallet);
    const paper = papers.find(p => p.id === paperId);

    if (!paper) {
      throw new Error('Paper not found');
    }

    return paper;
  } catch (error) {
    console.error('Error getting paper:', error);
    throw error;
  }
};

/**
 * Get a dataset by ID
 * @param {string} datasetId - The ID of the dataset
 * @returns {Promise<Object>} - The dataset
 */
export const getDatasetById = async (wallet, datasetId) => {
  try {
    // In a real implementation, this would query the blockchain for the dataset
    // For now, we'll return mock data
    const datasets = await getDatasets(wallet);
    const dataset = datasets.find(d => d.id === datasetId);

    if (!dataset) {
      throw new Error('Dataset not found');
    }

    return dataset;
  } catch (error) {
    console.error('Error getting dataset:', error);
    throw error;
  }
};
