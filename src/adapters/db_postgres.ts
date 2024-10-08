export class DBPostgres {

    async initialize() : Promise<void> {
        await fetch('http://localhost:4000/initialize');
    }

    async getAllRecords(tableName, orderBy=null, order=null) : Promise<any | null> {
        let query_params = '';
        query_params += orderBy ? `?orderBy=${orderBy}` : '';
        query_params += order ? `&order=${order}` : '';
        const response : Response = await fetch(`http://localhost:4000/${tableName}${query_params}`);
        const data = await response.json();
        return data;
    }

    async getRecordById(tableName, id) : Promise<any | null> {
        const response : Response = await fetch(`http://localhost:4000/${tableName}/${id}`);
        const data = await response.json();
        return data ? data[0] : null;
    }
    
    async createRecord(tableName, record) : Promise<any | null> {
        try{
            const response : Response = await fetch(`http://localhost:4000/${tableName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(record),
            });

            if (!response.ok) {
                console.log(response);
                throw new Error(response.statusText);
            }

            const data = await response.json();
            return data[0];

        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    async updateRecord(tableName, id, record) : Promise<any | null> {
        const response : Response = await fetch(`http://localhost:4000/${tableName}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
        });
        const data = await response.json();
        return data[0];
    }
    
    async deleteRecord(tableName, id) : Promise<any | null> {
        const response : Response = await fetch(`http://localhost:4000/${tableName}/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        return data[0];
    }

    async uploadFile(file) : Promise<any | null> {
        // create form data
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response : Response = await fetch(`http://localhost:4000/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            return data.url;

        } catch (error) {
            throw error;
        }
    }

    async deleteFile(file_name) : Promise<any | null> {
        //console.log("DELETE FILE POSTGRES: ", file_name);
        const response : Response = await fetch(`http://localhost:4000/delete/${file_name}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        return data;
    }
}