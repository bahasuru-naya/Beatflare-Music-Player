//Created by Bahasuru Nayanakantha
// Open or create IndexedDB
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FileStorageDB', 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'name' });
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject('Failed to open IndexedDB');
        };
    });
}

// Save files to IndexedDB with preserved order
async function saveFilesToIndexedDB() {
    const db = await openDatabase();
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');

    await store.clear(); // clear previous data

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const metadata = listItemMap.get(file.name) || null;

        store.put({
            name: file.name,
            file: file,
            meta: metadata,
            order: i // Store the current order
        });
    }

    transaction.oncomplete = () => {
        console.log('Files (with metadata and order) saved to IndexedDB');
    };

    transaction.onerror = () => {
        console.error('Error saving files to IndexedDB');
    };
}

// Load files from IndexedDB and restore order
async function loadFilesFromIndexedDB() {
    const db = await openDatabase();
    const transaction = db.transaction('files', 'readonly');
    const store = transaction.objectStore('files');

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = function () {
            const results = request.result;

            // Sort entries based on saved order
            results.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            files = results.map(entry => entry.file);

            listItemMap = new Map();
            for (const entry of results) {
                if (entry.meta !== undefined) {
                    listItemMap.set(entry.name, entry.meta);
                }
            }

            resolve(files);
        };

        request.onerror = function () {
            reject('Failed to load files from IndexedDB');
        };
    });
}
