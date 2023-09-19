import React, { VFC, useCallback } from "react";
import Modal from "@components/Modal";
import { Button, Input, Label } from "@pages/SignUp/styles";
import useInput from "@hooks/useInput";
import axios from "axios";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import fetcher from "@utils/fetcher";
import useSWR from "swr";
import { IChannel, IUser } from "@typings/db";

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowCreateChannelModal: (flag: boolean) => void;
}
const CreateChannelModal: VFC<Props> = ({ show, onCloseModal, setShowCreateChannelModal }) => {

  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const { data: userData, error, mutate } = useSWR<IUser>(
    "/api/users", 
    fetcher, 
    { dedupingInterval: 2000 }
  );
  const { mutate: mutateChannel } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null, 
    fetcher,
    { dedupingInterval: 2000 }
  );

  const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');

  const onCreateChannel = useCallback((e) => {
    e.preventDefault();
    axios.post(`/api/workspaces/${workspace}/channels`, {
        name: newChannel,
      }, {
        withCredentials: true,        //쿠키 전달
      }
    )
    .then((response) => {
      setShowCreateChannelModal(false);
      mutateChannel(response.data, false);
    })
    .catch((error) => {
      console.dir(error);
      toast.error(error.response?.data, { position: 'bottom-center' });
    });
  }, [newChannel]);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>Channel</span>
          <Input id="channel" value={newChannel} onChange={onChangeNewChannel}></Input>
        </Label>
        <Button type="submit">Create</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;