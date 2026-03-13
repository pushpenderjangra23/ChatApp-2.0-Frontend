import React from 'react';
import axios from 'axios';

const UserDetailsPopup = ({ currentUser, user, onClose, setChatUser, socket, setUser, setImageZoomShowModal }) => {
    if (!user) return null;

    const handleRemoveFriend = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/removefriend`, {
                friendId: user.id,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.data.message === 'Friend removed successfully') {
                socket.emit('friendRemove', { senderId: currentUser._id, ReceiverId: user.id });
                setUser(null);
                onClose();
                if (user.id) setChatUser(null);
                localStorage.removeItem(user.id);
            }
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="panel-strong rounded-3xl shadow-lg p-6 max-w-md w-full text-main">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">User Details</h2>
                    <button onClick={onClose} className="text-sub hover:text-main text-2xl leading-none">&times;</button>
                </div>

                <div className="flex items-start gap-4">
                    <img
                        src={user.profileimg}
                        alt={user.username}
                        className="rounded-full w-24 h-24 object-cover border border-soft cursor-pointer"
                        onClick={() => setImageZoomShowModal(true)}
                    />
                    <div className="min-w-0">
                        <h3 className="text-xl font-semibold truncate">{user.username}</h3>
                        <p className="text-sub break-all">Email: {user.email}</p>
                        <p className="text-sub">Bio: {user.description || 'No bio added'}</p>
                    </div>
                </div>

                <div className="mt-5">
                    <button onClick={handleRemoveFriend} className="danger-btn font-semibold py-2 px-4 rounded-xl">
                        Remove Friend
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPopup;
