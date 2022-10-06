import Head from "next/head";
import { trpc } from "../utils/trpc";
import { ReactElement, useEffect, useState } from "react";
import { NextPageWithLayout } from "./_app";
import Base from "../components/layouts/base";
import { useSession } from "next-auth/react";
import { Spinner1 } from "../components/atoms/spinners";
import { Button } from "../components/atoms/buttons";
// import HyperModal from "react-hyper-modal";
import { LabelInput } from "../components/atoms/inputs";
import { addItemSchema, markItemSchema, markItemsSchema, removeItemSchema, removeItemsSchema, updateItemSchema } from "../server/common/validation/todoItem";
import { TodoItemCard } from "../components/atoms/todo-item-cards";
import { env } from "../env/client.mjs";
import ReactModal from 'react-modal';
import { TRPCClientError } from "@trpc/client";
import { TodoRouter } from "../server/router/todo";

const Index: NextPageWithLayout = () => {
  // const HyperModal = dynamic(
  //   (() => import('react-hyper-modal')),
  //   { ssr: false }
  // );
  const { data: session, status } = useSession();
  // const [loadingScreen, setLoadingScreen] = useState<boolean>(true);
  // useEffect(() => {
  //   setTimeout(() => setLoadingScreen(false), 1000);
  // }, []);
  const [addItemModal, openAddItemModal] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string>("");
  const [addingItemTitle, setAddingItemTitle] = useState<string>("");
  const [addingItemTitleErrors, setAddingItemTitleErrors] = useState<string[]>([]);
  const [addingItemContent, setAddingItemContent] = useState<string>("");
  const [addingItemContentErrors, setAddingItemContentErrors] = useState<string[]>([]);
  const [modalMode, setModalMode] = useState<"create" | "edit" | undefined>();
  const { data: todoItemsCount, isLoading: isLoadingTodoItemsCount, isSuccess: isSuccessTodoItemsCount, isError: isErrorTodoItemsCount, status: statusTodoItemsCount, refetch: refetchTodoItemsCount } = trpc.useQuery(["todo.get-items-count"]);
  const [page, setPage] = useState<number>(0);
  const { data: todoItems, isLoading: isLoadingTodoItems, isSuccess: isSuccessTodoItems, isError: isErrorTodoItems, status: statusTodoItems, refetch: refetchTodoItems } = trpc.useQuery(["todo.get-items", { page: page } ]);
  const mutationAddItem = trpc.useMutation(["todo.add-item"]);
  const addItem = async () => {
    if (modalMode !== "create") return;
    const valid = addItemSchema.safeParse({ title: addingItemTitle, content: addingItemContent });
    if (valid.success) {
      setAddingItemTitleErrors([]);
      setAddingItemContentErrors([]);
      mutationAddItem.mutateAsync({ title: addingItemTitle, content: addingItemContent }).then((res) => {
        if (res) {
          refetchTodoItems();
          refetchTodoItemsCount();
          setAddingItemTitle("");
          setAddingItemContent("");
        }
      }).catch((err: TRPCClientError<TodoRouter>) => {
        alert(err.message);
      });
    } else {
      setAddingItemTitleErrors(valid.error.flatten().fieldErrors.title || []);
      setAddingItemContentErrors(valid.error.flatten().fieldErrors.content || []);
    }
  }
  const mutationUpdateItem = trpc.useMutation(["todo.update-item"]);
  const updateItem = async () => {
    if (modalMode !== "edit") return;
    const valid = updateItemSchema.safeParse({ itemId: editingItemId, title: addingItemTitle, content: addingItemContent });
    if (valid.success) {
      setAddingItemTitleErrors([]);
      setAddingItemContentErrors([]);
      mutationUpdateItem.mutateAsync({ itemId: editingItemId, title: addingItemTitle, content: addingItemContent }).then((res) => {
        if (res) {
          refetchTodoItems();
          refetchTodoItemsCount();
          setModalMode(undefined);
          openAddItemModal(false);
          setEditingItemId("");
          setAddingItemTitle("");
          setAddingItemContent("");
        }
      }).catch((err: TRPCClientError<TodoRouter>) => {
        alert(err.message);
      });
    } else {
      setAddingItemTitleErrors(valid.error.flatten().fieldErrors.title || []);
      setAddingItemContentErrors(valid.error.flatten().fieldErrors.content || []);
    }
  }
  const mutationMarkItem = trpc.useMutation(["todo.mark-item"]);
  const markOrUnmarkItem = async (itemId: string, markStatus: boolean) => {
    const valid = markItemSchema.safeParse({ itemId, markStatus });
    if (valid.success) {
      mutationMarkItem.mutateAsync({ itemId, markStatus }).then((res) => {
        if (res) {
          refetchTodoItems();
          refetchTodoItemsCount();
        }
      }).catch((err: TRPCClientError<TodoRouter>) => {
        alert(err.message);
      });
    } else {
      env.NEXT_PUBLIC_DEBUG && alert(valid.error.flatten().fieldErrors.itemId);
    }
  }
  const mutationMarkItems = trpc.useMutation(["todo.mark-items"])
  const markSelectedItems = async () => {
    const selectedIds = Object.keys(selectedItems).filter((key) => selectedItems[key]);
    const valid = markItemsSchema.safeParse({ itemIds: selectedIds, markStatus: true });
    if (valid.success) {
      mutationMarkItems.mutateAsync({ itemIds: selectedIds, markStatus: true }).then((res) => {
        if (res) {
          refetchTodoItems();
          refetchTodoItemsCount();
          setSelectedItems({});
        }
      }).catch((err: TRPCClientError<TodoRouter>) => {
        alert(err.message);
      });
    } else {
      env.NEXT_PUBLIC_DEBUG && alert(valid.error.flatten().fieldErrors.itemIds);
    }
  }
  const unmarkSelectedItems = async () => {
    const selectedIds = Object.keys(selectedItems).filter((key) => selectedItems[key]);
    const valid = markItemsSchema.safeParse({ itemIds: selectedIds, markStatus: false });
    if (valid.success) {
      mutationMarkItems.mutateAsync({ itemIds: selectedIds, markStatus: false }).then((res) => {
        if (res) {
          refetchTodoItems();
          refetchTodoItemsCount();
          setSelectedItems({});
        }
      }).catch((err: TRPCClientError<TodoRouter>) => {
        alert(err.message);
      });
    } else {
      env.NEXT_PUBLIC_DEBUG && alert(valid.error.flatten().fieldErrors.itemIds);
    }
  }
  const mutationRemoveItem = trpc.useMutation(["todo.remove-item"]);
  const removeItem = async (itemId: string) => {
    const valid = removeItemSchema.safeParse({ itemId });
    if (valid.success) {
      mutationRemoveItem.mutateAsync({ itemId }).then((res) => {
        if (res) {
          refetchTodoItems();
          refetchTodoItemsCount();
        }
      }).catch((err: TRPCClientError<TodoRouter>) => {
        alert(err.message);
      });
    } else {
      env.NEXT_PUBLIC_DEBUG && alert(valid.error.flatten().fieldErrors.itemId);
    }
  }
  const [selectedItems, setSelectedItems] = useState<{ [id: string]: boolean }>({});
  const mutationRemoveItems = trpc.useMutation(["todo.remove-items"]);
  const removeSelectedItems = async () => {
    const selectedIds = Object.keys(selectedItems).filter((key) => selectedItems[key]);
    const valid = removeItemsSchema.safeParse({ itemIds: selectedIds });
    if (valid.success) {
      mutationRemoveItems.mutateAsync({ itemIds: selectedIds }).then((res) => {
        if (res) {
          refetchTodoItems();
          refetchTodoItemsCount();
          setSelectedItems({});
        }
      }).catch((err: TRPCClientError<TodoRouter>) => {
        alert(err.message);
      });
    } else {
      env.NEXT_PUBLIC_DEBUG && alert(valid.error.flatten().fieldErrors.itemIds);
    }
  }
  const mutationRemoveCompleteItems = trpc.useMutation(["todo.remove-complete-items"]);
  const removeCompletedItems = async () => {
    mutationRemoveCompleteItems.mutateAsync().then((res) => {
      if (res) {
        refetchTodoItems();
        refetchTodoItemsCount();
        setSelectedItems({});
      }
    }).catch((err: TRPCClientError<TodoRouter>) => {
      alert(err.message);
    });
  }
  useEffect(() => {
    refetchTodoItemsCount();
    refetchTodoItems();
  }, [status]);
  return (
    <>
      <Head>
        <title>To Do List With Auth</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full flex items-start gap-4 h-main">
        {
          status === "loading" && (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner1 />
            </div>
          )
        }
        {
          status === "unauthenticated" && (
            <div className="w-full h-full flex justify-center items-center">
              <Button onClick={() => document.getElementById("sign-in-btn")?.click()}>Click to login</Button>
            </div>
          )
        }
        {
          status === "authenticated" && (
            <>
              <div className="container mx-auto h-full flex flex-col items-start">
                <div className="w-full flex justify-center mb-4">
                  <h4 className="text-3xl">To Do List</h4>
                </div>
                <div className="w-full flex items-center gap-4">
                  <Button onClick={() => {
                    setEditingItemId("");
                    setAddingItemTitle("");
                    setAddingItemContent("");
                    setModalMode("create");
                    openAddItemModal(true)
                  }}>Add Item</Button>
                  <Button disabled={Object.keys(selectedItems).filter((key) => selectedItems[key]).length === 0} onClick={markSelectedItems}>Mark Selected Items</Button>
                  <Button disabled={Object.keys(selectedItems).filter((key) => selectedItems[key]).length === 0} onClick={unmarkSelectedItems}>Unmark Selected Items</Button>
                  <Button disabled={Object.keys(selectedItems).filter((key) => selectedItems[key]).length === 0} onClick={removeSelectedItems}>Remove Selected Items</Button>
                  <Button onClick={removeCompletedItems}>Remove Completed Items</Button>
                  <div className="ml-auto">
                    {
                      isLoadingTodoItemsCount && <Spinner1 />
                    }
                    {
                      isSuccessTodoItemsCount && (
                        <>
                          <Button disabled={page <= 0} onClick={() => setPage(_page => _page - 1)}>{`<`}</Button>
                          { page > 3 && <span>|||</span>}
                          {
                            new Array(Math.ceil(todoItemsCount / env.NEXT_PUBLIC_CNTPERPAGE)).fill(true).map((_, num) => num).filter((_page) => Math.abs(_page - page) < 3).map((_page, id) => 
                              <Button key={id} className={_page === page ? "" : "bg-blue-400"} onClick={() => setPage(_page)}>{_page + 1}</Button>
                            )
                          }
                          { page < Math.ceil(todoItemsCount / env.NEXT_PUBLIC_CNTPERPAGE) - 4 && <span>|||</span>}
                          <Button disabled={(Math.ceil(todoItemsCount / env.NEXT_PUBLIC_CNTPERPAGE) - 1) <= page} onClick={() => setPage(_page => _page + 1)}>{`>`}</Button>
                        </>
                      )
                    }
                    {
                      isErrorTodoItemsCount && (
                        <p>{statusTodoItemsCount}</p>
                      )
                    }
                  </div>
                </div>
                <div className="w-full grid grid-cols-1 gap-4 mt-2 max-h-[80vh] overflow-auto">
                  {
                    isLoadingTodoItems && <Spinner1 />
                  }
                  {
                    isSuccessTodoItems && todoItems.map((todoItem, id) => (
                      <TodoItemCard
                        {...todoItem}
                        key={id}
                        selected={selectedItems[todoItem.id]}
                        onClickCheck={() => setSelectedItems(_prev => ({..._prev, [todoItem.id]: !_prev[todoItem.id] }))}
                        onClickEdit={() => {
                          setEditingItemId(todoItem.id);
                          setAddingItemTitle(todoItem.title);
                          setAddingItemContent(todoItem.content);
                          setModalMode("edit");
                          openAddItemModal(true);
                        }}
                        onClickMark={() => markOrUnmarkItem(todoItem.id, !todoItem.marked)}
                        onClickRemove={() => removeItem(todoItem.id)}
                      />
                    ))
                  }
                  {
                    isErrorTodoItems && (
                      <p>{statusTodoItems}</p>
                    )
                  }
                </div>
              </div>
              {/* <HyperModal
                isOpen={addItemModal}
                requestClose={() => openAddItemModal(false)}
                classes={{
                  wrapperClassName: "z-30",
                  portalWrapperClassName: "",
                  contentClassName: "add-item-modal p-10"
                }}
              > */}
              <ReactModal
                isOpen={addItemModal}
                onRequestClose={() => openAddItemModal(false)}
                overlayClassName="bg-white bg-opacity-50 fixed left-0 top-0 w-full h-full flex justify-center items-center"
                className="add-item-modal p-10 bg-white"
              >
                <div className="w-full h-full flex flex-col justify-center gap-4">
                  { modalMode === "edit" && <div className="flex justify-start items-center">
                    <span className="w-24">Id</span>
                    <span>{editingItemId}</span>
                  </div> }
                  <LabelInput label="Title" value={addingItemTitle} onChange={setAddingItemTitle} errors={addingItemTitleErrors} type="text" />
                  <LabelInput label="Content" value={addingItemContent} onChange={setAddingItemContent} errors={addingItemContentErrors} type="textarea" />
                  <div className="flex justify-center items-center gap-8">
                    { modalMode === 'create' && <Button onClick={addItem}>Add Item</Button> }
                    { modalMode === 'edit' && <Button onClick={updateItem}>Update Item</Button> }
                    <Button onClick={() => openAddItemModal(false)}>Cancel</Button>
                  </div>
                </div>
              {/* </HyperModal> */}
              </ReactModal>
            </>
          )
        }
      </div>
    </>
  );
};

Index.getLayout = (page: ReactElement) => {
  return (
    <Base>
      {page}
    </Base>
  )
}

export default Index;
