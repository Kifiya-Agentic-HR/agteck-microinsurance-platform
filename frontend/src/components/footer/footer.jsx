"use client";
import { Grid, List } from "@mantine/core";
import { services, socialLinks } from "../Data/footerData";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <Grid gutter={50}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Grid>
              {services.map((service, index) => (
                <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {service.title}
                  </h3>
                  <List spacing="xs">
                    {service.items.map((item, idx) => (
                      <List.Item key={idx} className="text-gray-400">
                        {item}
                      </List.Item>
                    ))}
                  </List>
                </Grid.Col>
              ))}
            </Grid>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Follow Us
              </h3>
              <div className="flex justify-center space-x-4">
                {socialLinks.map(({ icon: Icon, link }, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white"
                  >
                    <Icon size={24} />
                  </a>
                ))}
              </div>
            </div>
          </Grid.Col>
        </Grid>
        <div className="mt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Agtech MicroInsurance Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
}