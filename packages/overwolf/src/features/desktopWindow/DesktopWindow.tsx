import React from "react";
import { DesktopHeader } from "./DesktopHeader";
import { Title } from "components/Title/Title";
import { useTranslation } from "react-i18next";

//avoid the use of static text, use i18n instead, each language has its own text, and the text is stored in the
//locales folder in the project root
const DesktopWindow = () => {
  const { t } = useTranslation();

  return (
    <>
      <DesktopHeader />
      <div className="container">
        <header className="bg-red-400">
          <Title color="white">
            Current Locale: <b>{t("common.language")} 🌐</b>
            <br />
            {t("components.desktop.header")}
          </Title>
        </header>
      </div>
    </>
  );
};

export default DesktopWindow;
