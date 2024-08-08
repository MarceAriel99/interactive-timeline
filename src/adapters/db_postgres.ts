export class DBPostgres {

    async getAllRecords(tableName) : Promise<any[] | null> {
        const response : Response = await fetch(`http://localhost:4000/${tableName}`);
        const data = await response.json();
        return data;
    }

    async getRecordById(tableName, id) : Promise<any | null> {
        const response : Response = await fetch(`http://localhost:4000/${tableName}/${id}`);
        const data = await response.json();
        return data ? data[0] : null;
    }
    
    async createRecord(tableName, record) : Promise<any | null> {
        const response : Response = await fetch(`http://localhost:4000/${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
        });
        const data = await response.json();
        return data[0];
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
}