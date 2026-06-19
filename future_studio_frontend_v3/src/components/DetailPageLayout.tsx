import React from 'react';

interface DetailPageLayoutProps {
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({ mainContent, sidebarContent }) => {
  return (
    <section className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* CỘT TRÁI: Nội dung chính */}
        <div style={{ flex: '1 1 calc(100% - 360px)', minWidth: '320px' }}>
          {mainContent}
        </div>

        {/* CỘT PHẢI: Sidebar */}
        {sidebarContent}
      </div>
    </section>
  );
};

export default DetailPageLayout;