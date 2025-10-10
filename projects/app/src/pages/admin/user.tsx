import React, { useState, useEffect } from 'react';
import { fetchUsers, addUser, updateUser, deleteUser} from '@/web/support/user/api';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    useToast,
    Select,
} from '@chakra-ui/react';

import { serviceSideProps } from '@/web/common/i18n/utils';


export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        console.log('Loading users');
        try {
            const {fetchedUsers} = await fetchUsers();
            console.log("fetch", fetchedUsers);
            setUsers(fetchedUsers);
        } catch (error) {
            toast({
                title: "Failed to load users.",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.error(error);
        }
    };

    const handleAddUser = async (userData) => {
        try {
            const newUser = await addUser(userData);
            setUsers([...users, newUser.user]);
            onClose();
            toast({
                title: "User added.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Failed to add user.",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleUpdateUser = async (userData) => {
        try {
            const updatedUser = await updateUser(currentUser._id, userData);
            setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
            onClose();
            toast({
                title: "User updated.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Failed to update user.",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            setUsers(users.filter(user => user._id !== userId));
            toast({
                title: "User deleted.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Failed to delete user.",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const openAddModal = () => {
        setCurrentUser(null);
        onOpen();
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        onOpen();
    };

    return (
        <Box p={5}>
            <Button onClick={openAddModal} colorScheme="blue" mb={4}>
                Add User
            </Button>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Username</Th>
                        <Th>Status</Th>
                        <Th>Promotion Rate</Th>
                        <Th>Timezone</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {users.map((user) => (
                        <Tr key={user._id}>
                            <Td>{user.username}</Td>
                            <Td>{user.password}</Td> {/* 显示密码 */}
                            <Td>{user.status}</Td>
                            <Td>{user.promotionRate}%</Td>
                            <Td>{user.timezone}</Td>
                            <Td>
                                <HStack spacing={2}>
                                    <Button size="sm" onClick={() => openEditModal(user)}>
                                        Edit
                                    </Button>
                                    <Button size="sm" colorScheme="red" onClick={() => handleDeleteUser(user._id)}>
                                        Delete
                                    </Button>
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{currentUser ? 'Edit User' : 'Add User'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <UserForm user={currentUser} onSubmit={currentUser ? handleUpdateUser : handleAddUser} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}

function UserForm({ user, onSubmit }) {
    const [formData, setFormData] = useState(user || {
        username: '',
        password: '',
        status: 'active',
        promotionRate: 10,
        timezone: 'Asia/Shanghai'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input name="username" value={formData.username} onChange={handleChange} />
                </FormControl>
                {!user && (
                    <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input name="password" type="password" value={formData.password} onChange={handleChange} />
                    </FormControl>
                )}
                <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select name="status" value={formData.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel>Promotion Rate (%)</FormLabel>
                    <Input name="promotionRate" type="number" value={formData.promotionRate} onChange={handleChange} />
                </FormControl>
                <FormControl>
                    <FormLabel>Timezone</FormLabel>
                    <Input name="timezone" value={formData.timezone} onChange={handleChange} />
                </FormControl>
                <Button type="submit" colorScheme="blue">
                    {user ? 'Update' : 'Add'} User
                </Button>
            </VStack>
        </form>
    );
}

export async function getServerSideProps(content: any) {
    return {
        props: {
            ...(await serviceSideProps(content, ['publish', 'user']))
        }
    };
}