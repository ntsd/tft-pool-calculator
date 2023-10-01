export async function setPosition(
  windowId: string,
) {
  const gameRes = await getGameResolution();

  if (gameRes === null) {
    return;
  }

  overwolf.windows.changeSize(windowId, gameRes.width, gameRes.height);
  overwolf.windows.changePosition(
    windowId,
    0,
    0
  );
}

export async function getGameResolution(): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    overwolf.games.getRunningGameInfo((result) => {
      if (result && result.logicalWidth) {
        resolve({
          width: result.logicalWidth,
          height: result.logicalHeight,
        });
      } else {
        reject(null);
      }
    });
  });
}

export async function getAppResolution(): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve) => {
    overwolf.windows.getCurrentWindow((result) => {
      resolve({
        width: result.window.width,
        height: result.window.height,
      });
    });
  });
}
