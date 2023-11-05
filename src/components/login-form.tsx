"use client";

import {AnimatePresence, motion} from "framer-motion";
import {PropsWithChildren, useState} from "react";

import {icons} from "./icons";

type R = {
  status: number;
  body: {
    message: string;
  };
};

type Props = {
  // eslint-disable-next-line unused-imports/no-unused-vars
  onSubmit: (formdata: FormData) => Promise<R>;
};

function Message({
  children,
  onClick,
}: PropsWithChildren<{onClick: () => void}>) {
  return (
    <motion.div
      initial={{opacity: 0, y: -100}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -100}}
      className="relative flex h-full flex-1  items-center gap-2 rounded-sm border-2 border-red-800 bg-red-500/90 p-2 text-red-100"
    >
      <button className="absolute right-1 top-1" onClick={onClick}>
        <span>
          <icons.X />
        </span>
      </button>
      <span>
        <icons.Info />
      </span>
      {children}
    </motion.div>
  );
}

export default function LoginForm({onSubmit}: Props) {
  let [data, setData] = useState<R | null>(null);
  console.log("data", data);
  return (
    <>
      <div className="mb-2 flex min-h-[4rem] flex-col">
        <AnimatePresence>
          {data && data?.status !== 200 && (
            <Message
              onClick={() => {
                setData(null);
              }}
            >
              <p>Incorrect email or password</p>
            </Message>
          )}
        </AnimatePresence>
      </div>
      <form
        className="rounded-sm bg-gray-700/60 px-2 py-5"
        action={async (e) => {
          let res = await onSubmit(e);
          setData(res);
        }}
      >
        <fieldset className="flex flex-col gap-2">
          <label htmlFor="email" className="flex flex-col gap-1 capitalize">
            <span>email</span>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="rounded-sm border border-gray-500/60 px-2 py-1"
            />
          </label>
          <label htmlFor="password" className="flex flex-col gap-2 capitalize">
            <span>password</span>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="rounded-sm border border-gray-500/60 px-2 py-1"
            />
          </label>
          <button
            type="submit"
            className="rounded-sm border bg-primary-500 px-2 py-1"
          >
            Login
          </button>
        </fieldset>
      </form>
    </>
  );
}