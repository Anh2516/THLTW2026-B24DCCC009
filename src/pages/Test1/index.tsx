import { Table } from 'antd';

const Test1 = () => {


    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
    ];
    const hang = [
        {
            title: 'Lop',
            dataIndex: 'lop',
            key: 'lop',
        },
    ];
    const dataSource = [
        {
            name: 'John Doe',
            lop: '10A1',
            address: '123 Main St',
        },
    ];

	return <Table dataSource={dataSource} columns={columns} />;
};

export default Test1;